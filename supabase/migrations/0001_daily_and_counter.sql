-- Tinty — daily leaderboard + global play counter.
-- Run this in the Supabase SQL editor (or `supabase db push`).

-- ---------------------------------------------------------------------------
-- Global "games played, ever" counter
-- ---------------------------------------------------------------------------

create table if not exists public.counters (
  name  text   primary key,
  value bigint not null default 0
);

insert into public.counters (name, value) values ('total_games', 0)
  on conflict (name) do nothing;

alter table public.counters enable row level security;

drop policy if exists "counters readable by anyone" on public.counters;
create policy "counters readable by anyone"
  on public.counters for select using (true);
-- no insert/update/delete policies -> writes only via the function below

create or replace function public.bump_plays()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v bigint;
begin
  update public.counters set value = value + 1
    where name = 'total_games'
    returning value into v;
  return v;
end;
$$;

grant execute on function public.bump_plays() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Daily leaderboard
-- ---------------------------------------------------------------------------

create table if not exists public.daily_scores (
  id         uuid          primary key default gen_random_uuid(),
  ymd        date          not null,
  tag        text          not null,
  score      numeric(4, 2) not null,
  breakdown  numeric(3, 1)[] not null default '{}',
  created_at timestamptz   not null default now(),
  constraint daily_scores_tag_len   check (char_length(tag) between 1 and 3),
  constraint daily_scores_score_rng check (score >= 0 and score <= 50)
);

create index if not exists daily_scores_ymd_score_idx
  on public.daily_scores (ymd, score desc);

alter table public.daily_scores enable row level security;

drop policy if exists "daily scores readable by anyone" on public.daily_scores;
create policy "daily scores readable by anyone"
  on public.daily_scores for select using (true);

drop policy if exists "anyone can add a daily score" on public.daily_scores;
create policy "anyone can add a daily score"
  on public.daily_scores for insert with check (
    char_length(tag) between 1 and 3
    and score >= 0 and score <= 50
    and ymd between (now() at time zone 'utc')::date - 1
                and (now() at time zone 'utc')::date
  );
-- no update/delete policies -> a posted score is final
