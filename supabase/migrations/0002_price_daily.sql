-- Tinty — Price Check daily leaderboard.
-- Reuses the shared `counters` / `bump_plays` from 0001 for the site-wide
-- "games played, ever" counter. Run this in the Supabase SQL editor (or
-- `supabase db push`).

create table if not exists public.price_daily_scores (
  id         uuid          primary key default gen_random_uuid(),
  ymd        date          not null,
  tag        text          not null,
  score      numeric(4, 2) not null,
  breakdown  numeric(3, 1)[] not null default '{}',
  created_at timestamptz   not null default now(),
  constraint price_daily_scores_tag_len   check (char_length(tag) between 1 and 3),
  constraint price_daily_scores_score_rng check (score >= 0 and score <= 50)
);

create index if not exists price_daily_scores_ymd_score_idx
  on public.price_daily_scores (ymd, score desc);

alter table public.price_daily_scores enable row level security;

drop policy if exists "price daily scores readable by anyone" on public.price_daily_scores;
create policy "price daily scores readable by anyone"
  on public.price_daily_scores for select using (true);

drop policy if exists "anyone can add a price daily score" on public.price_daily_scores;
create policy "anyone can add a price daily score"
  on public.price_daily_scores for insert with check (
    char_length(tag) between 1 and 3
    and score >= 0 and score <= 50
    and ymd between (now() at time zone 'utc')::date - 1
                and (now() at time zone 'utc')::date
  );
-- no update/delete policies -> a posted score is final
