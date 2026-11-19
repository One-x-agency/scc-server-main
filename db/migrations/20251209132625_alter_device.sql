-- migrate:up

alter table devices alter column name drop not null;

-- migrate:down

alter table devices alter column name set not null;
