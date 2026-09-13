create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  study_domain_id uuid not null references study_domains(id) on delete restrict,
  source_type varchar(20) not null,
  approach varchar(30),
  front text not null,
  back text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cards_source_type_check
    check (source_type in ('manual', 'generated')),
  constraint cards_approach_check
    check (
      approach is null
      or approach in (
        'definicao',
        'comparacao',
        'causa_efeito',
        'aplicacao_pratica',
        'armadilha_conceitual',
        'verdadeiro_falso'
      )
    ),
  constraint cards_front_length_check
    check (char_length(trim(front)) >= 3),
  constraint cards_back_length_check
    check (char_length(trim(back)) >= 3)
);

create index if not exists cards_study_domain_id_idx
  on cards (study_domain_id);

create index if not exists cards_source_type_idx
  on cards (source_type);

create index if not exists cards_approach_idx
  on cards (approach);

