-- migrate:up


alter table customers drop column address;

-- migrate:down

alter table customers add column address text;
