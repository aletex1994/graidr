-- ============================================================
-- Rename scoring dimensions:
--   code_score     → structure_score
--   security_score → safety_score
--   ux_score       → completeness_score
--
-- Also update the generated `overall` column and leaderboard view.
-- ============================================================

-- 1. Rename columns
alter table scores rename column code_score     to structure_score;
alter table scores rename column security_score to safety_score;
alter table scores rename column ux_score       to completeness_score;

-- 2. Drop the view that depends on `overall` before we drop the column
drop view if exists leaderboard;

-- 3. Recreate the generated `overall` column
--    (can't alter a generated column — must drop and re-add)
alter table scores drop column overall;
alter table scores
  add column overall int2 generated always as (
    ((structure_score + safety_score + completeness_score) / 3)::int2
  ) stored;

-- 4. Recreate the leaderboard view with new column names
create or replace view leaderboard as
with latest as (
  select distinct on (repo_id)
    s.*
  from scores s
  order by repo_id, scored_at desc
)
select
  rank() over (order by l.overall desc) as rank,
  r.owner,
  r.name,
  r.github_url,
  l.structure_score,
  l.safety_score,
  l.completeness_score,
  l.overall,
  l.details,
  l.commit_sha,
  l.rated_with,
  l.scored_at
from latest l
join repos r on r.id = l.repo_id;
