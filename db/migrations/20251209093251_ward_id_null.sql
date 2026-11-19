-- migrate:up


alter table devices alter column ward_id drop not null;
alter table devices alter column number_of_zones drop not null;
alter table devices alter column number_of_zones drop default;


-- migrate:down

alter table devices alter column ward_id set not null;
alter table devices alter column number_of_zones set default 0;
alter table devices alter column number_of_zones set not null;
