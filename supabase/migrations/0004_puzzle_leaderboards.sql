-- Tinty — Picture Puzzle leaderboards.
-- Run this in the Supabase SQL editor (or `supabase db push`) AFTER 0003.
--
-- 0003 whitelists board strings in two places (a CHECK constraint on
-- leaderboard_scores and a guard in submit_leaderboard_score). This widens
-- both to accept the four Picture Puzzle boards:
--   all-time : 'puzzle:easy' | 'puzzle:medium' | 'puzzle:hard'
--   daily    : 'puzzle:daily:YYYY-MM-DD'
-- Puzzle scores are out of 10, which already fits the 0–50 score column.
-- No new tables; realtime + RLS from 0003 cover the new boards as-is.

alter table public.leaderboard_scores
  drop constraint if exists leaderboard_scores_board_shape;

alter table public.leaderboard_scores
  add constraint leaderboard_scores_board_shape check (
    board ~ '^(color:(easy|hard)|price:solo|puzzle:(easy|medium|hard)|(color|price|puzzle):daily:\d{4}-\d{2}-\d{2})$'
  );

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
  if p_board !~ '^(color:(easy|hard)|price:solo|puzzle:(easy|medium|hard)|(color|price|puzzle):daily:\d{4}-\d{2}-\d{2})$' then
    raise exception 'invalid board %', p_board;
  end if;

  -- puzzle boards are scored out of 10, the others out of 50
  if p_board like 'puzzle:%' then
    v_score := round(least(10, greatest(0, coalesce(p_score, 0)))::numeric, 2);
  else
    v_score := round(least(50, greatest(0, coalesce(p_score, 0)))::numeric, 2);
  end if;
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
