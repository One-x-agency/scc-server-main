-- migrate:up


create table user_notification_tokens(
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  token text not null,
  created_at timestamptz default current_timestamp not null,
  constraint pk_user_notification_tokens primary key (id),
  constraint fk_user_notification_tokens_user_id foreign key (user_id) references users(id),
  constraint uk_user_notification_tokens_user_id_token unique (user_id, token)
);

create table user_custom_alert_schemas(
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  name varchar(255) not null,
  description text,
  message text,
  field_name varchar(255) not null,
  operator varchar(5) not null,
  value numeric(12,6) not null,
  created_at timestamptz default current_timestamp not null,
  constraint pk_user_custom_alert_schemas primary key (id),
  constraint fk_user_custom_alert_schemas_user_id foreign key (user_id) references users(id),
  constraint uk_user_custom_alert_schemas_user_id_name unique (user_id, name),
  constraint uk_user_custom_alert_schemas_user_id_field_name_operator unique (user_id, field_name, operator)
);

-- migrate:down

drop table user_custom_alert_schemas;
drop table user_notification_tokens;
