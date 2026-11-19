-- migrate:up


alter table orders drop column serial;
alter table orders add column serial varchar(50) GENERATED ALWAYS AS (('FIRELYNK-SI-'::text || serial_number)) STORED;

-- migrate:down
alter table orders drop column serial;
alter table orders add column serial varchar(50) GENERATED ALWAYS AS (('FIRELYNK-ORDER-'::text || serial_number)) STORED;
