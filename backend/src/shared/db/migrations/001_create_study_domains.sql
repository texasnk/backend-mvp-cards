create extension if not exists pgcrypto;

create table if not exists study_domains (
  id uuid primary key default gen_random_uuid(),
  name varchar(40) not null,
  name_normalized varchar(40) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_domains_name_length_check
    check (char_length(trim(name)) between 3 and 40),
  constraint study_domains_name_normalized_unique
    unique (name_normalized)
);

create index if not exists study_domains_name_idx
  on study_domains (name);

