create table if not exists processing_requests (
  id uuid primary key,
  input_type varchar(20) not null,
  provided_domain_id uuid references study_domains(id) on delete set null,
  resolved_domain_id uuid references study_domains(id) on delete set null,
  status varchar(30) not null,
  cards_requested smallint not null,
  cards_created smallint not null default 0,
  cards_persisted smallint not null default 0,
  suggested_domain_name varchar(40),
  extracted_text_chars integer not null default 0,
  failure_code varchar(50),
  failure_reason text,
  started_at timestamptz not null,
  finished_at timestamptz,
  constraint processing_requests_input_type_check
    check (input_type in ('text', 'image', 'pdf')),
  constraint processing_requests_status_check
    check (status in ('started', 'succeeded', 'failed', 'succeeded_without_persistence')),
  constraint processing_requests_cards_requested_check
    check (cards_requested between 1 and 10),
  constraint processing_requests_cards_created_check
    check (cards_created >= 0),
  constraint processing_requests_cards_persisted_check
    check (cards_persisted >= 0),
  constraint processing_requests_extracted_text_chars_check
    check (extracted_text_chars >= 0),
  constraint processing_requests_suggested_domain_name_length_check
    check (
      suggested_domain_name is null
      or char_length(trim(suggested_domain_name)) between 3 and 40
    )
);

create index if not exists processing_requests_status_idx
  on processing_requests (status);

create index if not exists processing_requests_started_at_idx
  on processing_requests (started_at desc);
