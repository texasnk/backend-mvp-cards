alter table cards add column if not exists state varchar(12) not null default 'new';
alter table cards add column if not exists due_at timestamptz not null default now();
alter table cards add column if not exists learning_step smallint not null default 0;
alter table cards add column if not exists interval_days integer not null default 0;
alter table cards add column if not exists ease_factor numeric(4,2) not null default 2.50;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cards_state_check') then
    alter table cards add constraint cards_state_check check (state in ('new', 'learning', 'review', 'relearn'));
  end if;
end $$;
create index if not exists cards_due_at_idx on cards (study_domain_id, due_at);
create table if not exists card_reviews (
  id uuid primary key default gen_random_uuid(), card_id uuid not null references cards(id) on delete cascade,
  rating varchar(8) not null check (rating in ('again', 'hard', 'good', 'easy')),
  previous_state varchar(12) not null, next_state varchar(12) not null,
  reviewed_at timestamptz not null default now(), due_at timestamptz not null,
  interval_days integer not null, ease_factor numeric(4,2) not null
);
create index if not exists card_reviews_card_id_reviewed_at_idx on card_reviews (card_id, reviewed_at desc);
