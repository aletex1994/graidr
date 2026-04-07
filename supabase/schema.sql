-- ============================================================
-- graidr schema
-- ============================================================

-- repos ---------------------------------------------------------
create table if not exists repos (
  id           uuid primary key default gen_random_uuid(),
  github_url   text not null unique,
  owner        text not null,
  name         text not null,
  inserted_at  timestamptz not null default now()
);

-- scores --------------------------------------------------------
create table if not exists scores (
  id                  uuid primary key default gen_random_uuid(),
  repo_id             uuid not null references repos(id) on delete cascade,
  commit_sha          text not null,
  branch              text not null,
  structure_score     int2 not null check (structure_score between 0 and 100),
  safety_score        int2 not null check (safety_score between 0 and 100),
  completeness_score  int2 not null check (completeness_score between 0 and 100),
  overall             int2 generated always as (
                       ((structure_score + safety_score + completeness_score) / 3)::int2
                     ) stored,
  category            text not null default 'other' check (category in ('portfolio', 'saas', 'e-commerce', 'blog', 'dashboard', 'api', 'cli', 'library', 'docs', 'other')),
  details             jsonb,  -- { top_issues: string[], doing_well: string[] }
  rated_with          text not null default 'gpt-4o' check (rated_with in ('gpt-4o', 'gpt-4o-deep')),
  scored_at           timestamptz not null default now()
);

-- leaderboard view ----------------------------------------------
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

-- RLS -----------------------------------------------------------
alter table repos   enable row level security;
alter table scores  enable row level security;

-- public read
create policy "public read repos"
  on repos for select
  using (true);

create policy "public read scores"
  on scores for select
  using (true);

-- No anon write policies.
-- All writes go through the submit-score Edge Function,
-- which authenticates via GitHub token and uses the
-- service_role key (server-side only, never exposed).

-- Unique constraint to prevent replay attacks (same SHA twice)
alter table scores
  add constraint if not exists scores_commit_sha_unique unique (commit_sha);

-- Indexes for performance ----------------------------------------
create index if not exists idx_scores_repo_scored_at
  on scores (repo_id, scored_at desc);

create index if not exists idx_scores_repo_id
  on scores (repo_id);
