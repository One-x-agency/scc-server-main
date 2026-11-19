-- migrate:up


create table customer_notification_tokens (
  id uuid default gen_random_uuid() not null,
  customer_id uuid not null,
  token text not null,
  created_at timestamp with time zone default current_timestamp not null,
  constraint pk_customer_notification_tokens primary key (id),
  constraint fk_customer_notification_tokens_customer_id foreign key (customer_id) references customers(id),
  constraint uk_customer_notification_tokens_customer_id_token unique (customer_id, token)
);


-- migrate:down

drop table customer_notification_tokens;
