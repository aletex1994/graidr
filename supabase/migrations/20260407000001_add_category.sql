-- Add category column to scores
alter table scores
  add column if not exists category text not null default 'other'
  check (category in ('portfolio', 'saas', 'e-commerce', 'blog', 'dashboard', 'api', 'cli', 'library', 'docs', 'other'));

-- Drop and recreate leaderboard view to include category
drop view if exists leaderboard;

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
  l.category,
  l.details,
  l.commit_sha,
  l.rated_with,
  l.scored_at
from latest l
join repos r on r.id = l.repo_id;
