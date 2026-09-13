alter table cards drop constraint if exists cards_back_length_check;

alter table cards add constraint cards_back_length_check
  check (char_length(trim(back)) >= 1);
