-- migrate:up


update orders set shipping_state_id = (select id from states where name = 'Gujarat') where shipping_state_id is null;

update orders set billing_state_id = (select id from states where name = 'Gujarat') where billing_state_id is null;

update orders set billing_city = 'Rajkot' where billing_city is null;
update orders set shipping_city = 'Rajkot' where shipping_city is null;

update orders set billing_postal_code = '360001' where billing_postal_code is null;
update orders set shipping_postal_code = '360001' where shipping_postal_code is null;

update orders set billing_address = 'auto filed address while migration' where billing_address is null;
update orders set billing_address = shipping_address where billing_address is null;


-- migrate:down

