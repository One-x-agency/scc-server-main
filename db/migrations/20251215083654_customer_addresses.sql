-- migrate:up


create type customer_address_type as enum ('billing', 'shipping');

create table customer_addresses (
  id uuid default gen_random_uuid() not null,
  type customer_address_type not null,
  customer_id uuid not null,
  address text not null,
  state_id uuid not null,
  city varchar(255) not null,
  postal_code varchar(10) not null,
  created_at timestamp with time zone default current_timestamp not null,
  updated_at timestamp with time zone,
  constraint pk_customer_addresses primary key (id),
  constraint fk_customer_addresses_customer_id foreign key (customer_id) references customers(id),
  constraint fk_customer_addresses_state_id foreign key (state_id) references states(id)
);


-- migrate:down

drop table customer_addresses;
drop type customer_address_type;
