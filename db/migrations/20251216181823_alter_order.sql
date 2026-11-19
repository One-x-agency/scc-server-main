-- migrate:up


alter table orders
add column shipping_state_id uuid,
add column shipping_city varchar(255),
add column shipping_postal_code varchar(10),
add column billing_address text,
add column billing_state_id uuid,
add column billing_city varchar(255),
add column billing_postal_code varchar(10),
add column dealer_commission_percentage numeric(5,2) default 0 not null,
add column dealer_commission_amount integer generated always as (((sub_total + (sub_total * gst_percentage / 100)) * dealer_commission_percentage) / 100) stored;

alter table orders add constraint fk_orders_shipping_state_id foreign key (shipping_state_id) references states(id);
alter table orders add constraint fk_orders_billing_state_id foreign key (billing_state_id) references states(id);


update orders
set dealer_commission_percentage = COALESCE(
  (select commission_percentage from dealers where id = dealer_id),
  0
);


-- migrate:down

alter table orders drop column shipping_state_id;
alter table orders drop column shipping_city;
alter table orders drop column shipping_postal_code;
alter table orders drop column billing_address;
alter table orders drop column billing_state_id;
alter table orders drop column billing_city;
alter table orders drop column billing_postal_code;
alter table orders drop column dealer_commission_percentage;
alter table orders drop column dealer_commission_amount;
