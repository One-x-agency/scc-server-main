-- migrate:up

alter table sim_cards rename column number to phone_number;
alter table sim_cards alter column phone_number type varchar(15);
alter table sim_cards add column number varchar(50);

-- migrate:down

alter table sim_cards drop column number;
alter table sim_cards rename column phone_number to number;
alter table sim_cards alter column number type varchar(255);
