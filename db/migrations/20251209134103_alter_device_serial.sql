-- migrate:up


alter table devices drop column serial;
alter table devices add column serial varchar(50) GENERATED ALWAYS AS (('AALRT-'::text || serial_number)) STORED;


-- migrate:down

alter table devices drop column serial;
alter table devices add column serial varchar(50) GENERATED ALWAYS AS (('SFPL-AALRT-'::text || serial_number)) STORED;
