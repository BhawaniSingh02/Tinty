-- Tinty — unified leaderboards (all-time + daily) for every game/mode.
-- Run this in the Supabase SQL editor (or `supabase db push`).
--
-- Replaces the tag-based `daily_scores` / `price_daily_scores` boards from
-- 0001 / 0002 with one system: a persistent per-device identity + display
-- name, one personal-best row per device per board, top-50 reads, and realtime
-- so an open leaderboard updates the moment a qualifying score lands.
--
-- Board strings (one text column, so the realtime `board=eq.…` filter is exact
-- and the daily reset is automatic — a new UTC day is simply a new value):
--   all-time : 'color:easy' | 'color:hard' | 'price:solo'
--   daily    : 'color:daily:YYYY-MM-DD' | 'price:daily:YYYY-MM-DD'
--
-- The 0001 `counters` / `bump_plays` (site-wide "games played, ever") are
-- untouched and still in use. The old daily tables are left in place, unused.

-- ---------------------------------------------------------------------------
-- players — one display name per device, globally unique (case-insensitive)
-- ---------------------------------------------------------------------------

create table if not exists public.players (
  device_id  text        primary key,
  name       text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint players_name_len check (char_length(name) between 1 and 40)
);

create unique index if not exists players_name_ci_idx
  on public.players (lower(name));

alter table public.players enable row level security;

drop policy if exists "players readable by anyone" on public.players;
create policy "players readable by anyone"
  on public.players for select using (true);
-- no insert/update/delete policies -> writes only via the SECURITY DEFINER RPCs

-- ---------------------------------------------------------------------------
-- leaderboard_scores — one personal-best row per device per board
-- ---------------------------------------------------------------------------

create table if not exists public.leaderboard_scores (
  board      text            not null,
  device_id  text            not null references public.players (device_id) on delete cascade,
  score      numeric(4, 2)   not null,
  breakdown  numeric(3, 1)[] not null default '{}',
  updated_at timestamptz     not null default now(),
  primary key (board, device_id),
  constraint leaderboard_scores_score_rng check (score >= 0 and score <= 50),
  constraint leaderboard_scores_board_shape check (
    board ~ '^(color:(easy|hard)|price:solo|(color|price):daily:\d{4}-\d{2}-\d{2})$'
  )
);

-- best-first, earlier-submission-first for ties
create index if not exists leaderboard_scores_board_rank_idx
  on public.leaderboard_scores (board, score desc, updated_at asc);

alter table public.leaderboard_scores enable row level security;

drop policy if exists "leaderboard readable by anyone" on public.leaderboard_scores;
create policy "leaderboard readable by anyone"
  on public.leaderboard_scores for select using (true);
-- no insert/update/delete policies -> writes only via the SECURITY DEFINER RPC

-- Emit realtime change events for open leaderboards. (Safe to re-run: the
-- add is guarded so a second migration run doesn't error.)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'leaderboard_scores'
  ) then
    alter publication supabase_realtime add table public.leaderboard_scores;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- claim_player_name — resolve a device's display name, de-duplicating across
-- devices by appending the smallest free number ("Bhoni" -> "Bhoni2").
-- ---------------------------------------------------------------------------

create or replace function public.claim_player_name(
  p_device_id text,
  p_desired   text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base  text;
  v_try   text;
  v_n     int := 1;
  v_owner text;
begin
  -- sanitize: trim, collapse inner whitespace, cap length
  v_base := btrim(regexp_replace(coalesce(p_desired, ''), '\s+', ' ', 'g'));
  v_base := left(v_base, 40);
  if v_base = '' then
    raise exception 'display name is empty';
  end if;

  -- already ours under this exact name? keep it.
  select name into v_owner from public.players where device_id = p_device_id;
  if v_owner is not null and lower(v_owner) = lower(v_base) then
    return v_owner;
  end if;

  v_try := v_base;
  loop
    select device_id into v_owner
      from public.players
     where lower(name) = lower(v_try)
     limit 1;

    if v_owner is null or v_owner = p_device_id then
      exit; -- free, or already held by this device
    end if;

    v_n := v_n + 1;
    v_try := v_base || v_n::text;
  end loop;

  insert into public.players (device_id, name)
    values (p_device_id, v_try)
    on conflict (device_id)
    do update set name = excluded.name, updated_at = now();

  return v_try;
end;
$$;

grant execute on function public.claim_player_name(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- submit_leaderboard_score — claim the name, upsert the row only if it beats
-- the device's existing score for that board, return the resulting standing.
-- ---------------------------------------------------------------------------

create or replace function public.submit_leaderboard_score(
  p_board     text,
  p_device_id text,
  p_name      text,
  p_score     numeric,
  p_breakdown numeric[] default '{}'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name    text;
  v_score   numeric(4, 2);
  v_stored  numeric(4, 2);
  v_updated boolean := false;
  v_rank    int;
  v_total   int;
begin
  if p_board !~ '^(color:(easy|hard)|price:solo|(color|price):daily:\d{4}-\d{2}-\d{2})$' then
    raise exception 'invalid board %', p_board;
  end if;

  v_score := round(least(50, greatest(0, coalesce(p_score, 0)))::numeric, 2);
  v_name  := public.claim_player_name(p_device_id, p_name);

  insert into public.leaderboard_scores (board, device_id, score, breakdown)
    values (p_board, p_device_id, v_score, coalesce(p_breakdown, '{}'))
    on conflict (board, device_id) do update
      set score = excluded.score,
          breakdown = excluded.breakdown,
          updated_at = now()
      where excluded.score > public.leaderboard_scores.score
    returning score into v_stored;

  if v_stored is not null then
    v_updated := true;
  end if;

  select score into v_stored
    from public.leaderboard_scores
   where board = p_board and device_id = p_device_id;

  select count(*) + 1 into v_rank
    from public.leaderboard_scores
   where board = p_board and score > v_stored;

  select count(*) into v_total
    from public.leaderboard_scores
   where board = p_board;

  return json_build_object(
    'name', v_name,
    'score', v_stored,
    'rank', v_rank,
    'total', v_total,
    'updated', v_updated
  );
end;
$$;

grant execute on function public.submit_leaderboard_score(text, text, text, numeric, numeric[])
  to anon, authenticated;
