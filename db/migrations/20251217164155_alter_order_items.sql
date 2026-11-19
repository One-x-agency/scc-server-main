-- migrate:up


alter table order_items
add column gst_percentage numeric(5,2) default 0 not null;

update order_items set price = price / 1.18;

update order_items set gst_percentage = 18;

alter table orders drop column total;
alter table orders drop column gst_amount;

alter table orders drop column dealer_commission_amount;
ALTER TABLE orders ADD column dealer_commission_amount integer GENERATED ALWAYS AS ((sub_total * dealer_commission_percentage / 100::numeric)) STORED;

alter table orders drop column gst_percentage;

alter table orders add column total numeric(12,2);

update orders set total = sub_total;

alter table orders alter column total set not null;



-- migrate:down

alter table order_items drop column gst_percentage;

update order_items set price = price * 1.18;




