-- migrate:up


create table customer_alerts (
  id uuid default gen_random_uuid() not null,
  name varchar(255) not null,
  description text,
  customer_id uuid not null,
  field_name varchar(255) not null,
  operator varchar(5) not null,
  value numeric(12,6) not null,
  created_at timestamptz default current_timestamp not null,
  updated_at timestamptz,
  constraint pk_customer_alerts primary key (id),
  constraint fk_customer_alerts_customer_id foreign key (customer_id) references customers(id),
  constraint uk_customer_alerts_customer_id_field_name_operator unique (customer_id, field_name, operator),
  constraint uk_customer_alerts_customer_id_name unique (customer_id, name)
);



-- migrate:down

drop table customer_alerts;
