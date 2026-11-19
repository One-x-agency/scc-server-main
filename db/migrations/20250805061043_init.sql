-- migrate:up

CREATE TYPE public.gender AS ENUM (
    'male',
    'female'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: calibrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calibrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid NOT NULL,
    io_element_label character varying(255) NOT NULL,
    conversion_factor numeric(12,6) DEFAULT (1)::numeric NOT NULL,
    calibration jsonb[] NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    created_by uuid,
    updated_by uuid
);


--
-- Name: customer_cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    service_id uuid NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    phone_number character varying(15) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(2000) NOT NULL,
    address text,
    is_email_verified boolean DEFAULT false NOT NULL,
    is_phone_number_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    organization_name character varying(255),
    gst_number character varying(15),
    pan_number character varying(10)
);


--
-- Name: dealer_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dealer_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying(100) NOT NULL,
    dealer_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    created_by uuid NOT NULL,
    updated_by uuid,
    remark text,
    dealer_withdraw_request_id uuid,
    CONSTRAINT cc_dealer_transactions_amount CHECK ((amount > (0)::numeric)),
    CONSTRAINT cc_dealer_transactions_type CHECK (((type)::text = ANY (ARRAY[('in'::character varying)::text, ('out'::character varying)::text])))
);


--
-- Name: dealer_withdraw_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dealer_withdraw_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dealer_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    status character varying(100) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    created_by uuid NOT NULL,
    updated_by uuid,
    remark text,
    CONSTRAINT cc_dealer_withdraw_requests_amount CHECK ((amount > (0)::numeric))
);


--
-- Name: dealers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dealers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    pan_number character varying(10) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    promo_code character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid,
    balance integer DEFAULT 0 NOT NULL,
    commission_percentage numeric(12,2) DEFAULT 0 NOT NULL
);


--
-- Name: device_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid NOT NULL,
    alert_type character varying(255) NOT NULL,
    alert_message text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: device_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_logs (
    device_id uuid NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    imei character varying(50) NOT NULL,
    record jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.devices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ward_id uuid NOT NULL,
    imei character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    created_by uuid,
    updated_by uuid,
    pin_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    sim_card_id uuid,
    customer_id uuid,
    serial_number integer NOT NULL,
    serial character varying(50) GENERATED ALWAYS AS (('SFPL-AALRT-'::text || serial_number)) STORED,
    brand text,
    model_number text,
    system_type text,
    pumps jsonb DEFAULT '[]'::jsonb NOT NULL,
    occupancy_type text,
    number_of_floors integer,
    number_of_blocks integer,
    address text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    alternative_contacts jsonb DEFAULT '[]'::jsonb NOT NULL,
    number_of_zones integer DEFAULT 0 NOT NULL,
    noc_expires_at timestamp with time zone,
    noc_file_id uuid,
    order_id uuid,
    service_id uuid
);


--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    s3_key text NOT NULL,
    url text,
    size bigint,
    status character varying(100) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fire_stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fire_stations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    state_id uuid NOT NULL
);


--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(255) NOT NULL,
    message text NOT NULL,
    status character varying(100) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    service_id uuid NOT NULL
);


--
-- Name: order_status_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    status character varying(255) NOT NULL,
    remark text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    created_by uuid,
    updated_by uuid,
    sub_total numeric(12,2) NOT NULL,
    gst_percentage numeric(12,2) DEFAULT 0 NOT NULL,
    gst_amount numeric(12,2) GENERATED ALWAYS AS (((sub_total * gst_percentage) / (100)::numeric)) STORED NOT NULL,
    total numeric(12,2) GENERATED ALWAYS AS ((sub_total + ((sub_total * gst_percentage) / (100)::numeric))) STORED NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    razorpay_payment_id character varying(255),
    razorpay_order_id character varying(255),
    razorpay_signature text,
    dealer_id uuid,
    serial_number integer NOT NULL,
    serial character varying(50) GENERATED ALWAYS AS (('SFPL-ORDER-'::text || serial_number)) STORED,
    customer_name character varying(255) NOT NULL,
    organization_name character varying(255),
    gst_number character varying(15),
    pan_number character varying(10),
    shipping_address text
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    access_level integer DEFAULT 1 NOT NULL,
    CONSTRAINT cc_permissions_access_level CHECK (((access_level >= 1) AND (access_level <= 4)))
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    access_level integer DEFAULT 1 NOT NULL,
    CONSTRAINT cc_role_permissions_access_level CHECK (((access_level >= 1) AND (access_level <= 4)))
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text
);



--
-- Name: service_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    file_id uuid NOT NULL,
    service_id uuid NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    price integer NOT NULL,
    description text,
    created_by uuid,
    updated_by uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: sim_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sim_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255) NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    sim_plan_id uuid NOT NULL,
    imsi_number character varying(50),
    activation_date date,
    deactivation_date date,
    expiry_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    created_by uuid,
    updated_by uuid
);


--
-- Name: sim_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sim_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    sms_limit integer DEFAULT 0 NOT NULL,
    data_limit numeric(12,2) DEFAULT 0 NOT NULL,
    call_limit integer DEFAULT 0 NOT NULL,
    subscription_amount numeric(12,2) DEFAULT 0 NOT NULL,
    remark text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    created_by uuid,
    updated_by uuid
);


--
-- Name: states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    gst_code character varying(7) NOT NULL,
    is_union_territory boolean DEFAULT false NOT NULL
);


--
-- Name: tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tokens (
    token character varying(2000) NOT NULL,
    value character varying(10),
    expires_at timestamp with time zone NOT NULL
);


--
-- Name: user_device_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_device_mapping (
    user_id uuid NOT NULL,
    device_id uuid NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    logged_out_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    is_root_user boolean DEFAULT false NOT NULL,
    name character varying(255) NOT NULL,
    phone_number character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(2000),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: wards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    zone_id uuid NOT NULL,
    name character varying(255) NOT NULL
);


--
-- Name: zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    fire_station_id uuid NOT NULL
);


--
-- Name: customers customers_unique_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_unique_email UNIQUE (email);


--
-- Name: customers customers_unique_phone_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_unique_phone_number UNIQUE (phone_number);


--
-- Name: fire_stations fire_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fire_stations
    ADD CONSTRAINT fire_stations_pkey PRIMARY KEY (id);


--
-- Name: calibrations pk_calibrations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calibrations
    ADD CONSTRAINT pk_calibrations PRIMARY KEY (id);


--
-- Name: customer_cart_items pk_customer_cart_items; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_cart_items
    ADD CONSTRAINT pk_customer_cart_items PRIMARY KEY (id);


--
-- Name: customers pk_customers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT pk_customers PRIMARY KEY (id);


--
-- Name: dealer_transactions pk_dealer_transactions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealer_transactions
    ADD CONSTRAINT pk_dealer_transactions PRIMARY KEY (id);


--
-- Name: dealer_withdraw_requests pk_dealer_withdraw_requests; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealer_withdraw_requests
    ADD CONSTRAINT pk_dealer_withdraw_requests PRIMARY KEY (id);


--
-- Name: dealers pk_dealers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT pk_dealers PRIMARY KEY (id);


--
-- Name: device_alerts pk_device_alerts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_alerts
    ADD CONSTRAINT pk_device_alerts PRIMARY KEY (id);


--
-- Name: devices pk_devices; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT pk_devices PRIMARY KEY (id);


--
-- Name: files pk_files; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT pk_files PRIMARY KEY (id);


--
-- Name: inquiries pk_inquiries; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT pk_inquiries PRIMARY KEY (id);


--
-- Name: order_items pk_order_items; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT pk_order_items PRIMARY KEY (id);


--
-- Name: order_status_logs pk_order_status_logs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_logs
    ADD CONSTRAINT pk_order_status_logs PRIMARY KEY (id);


--
-- Name: orders pk_orders; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT pk_orders PRIMARY KEY (id);


--
-- Name: permissions pk_permissions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT pk_permissions PRIMARY KEY (id);


--
-- Name: service_images pk_product_images; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_images
    ADD CONSTRAINT pk_product_images PRIMARY KEY (id);


--
-- Name: services pk_products; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT pk_products PRIMARY KEY (id);


--
-- Name: role_permissions pk_role_permissions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id);


--
-- Name: roles pk_roles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT pk_roles PRIMARY KEY (id);


--
-- Name: sim_cards pk_sim_cards; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_cards
    ADD CONSTRAINT pk_sim_cards PRIMARY KEY (id);


--
-- Name: sim_plans pk_sim_plans; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_plans
    ADD CONSTRAINT pk_sim_plans PRIMARY KEY (id);


--
-- Name: states pk_states; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT pk_states PRIMARY KEY (id);


--
-- Name: user_device_mapping pk_user_device_mapping; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_device_mapping
    ADD CONSTRAINT pk_user_device_mapping PRIMARY KEY (user_id, device_id);


--
-- Name: user_sessions pk_user_sessions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT pk_user_sessions PRIMARY KEY (id);


--
-- Name: users pk_users; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_users PRIMARY KEY (id);


--
-- Name: user_roles pk_users_roles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT pk_users_roles PRIMARY KEY (user_id, role_id);


--
-- Name: wards pk_wards; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT pk_wards PRIMARY KEY (id);


--
-- Name: zones pk_zones; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT pk_zones PRIMARY KEY (id);


--
-- Name: calibrations uk_calibrations_device_id_io_element_label; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calibrations
    ADD CONSTRAINT uk_calibrations_device_id_io_element_label UNIQUE (device_id, io_element_label);


--
-- Name: customer_cart_items uk_customer_cart_items_customer_id_service_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_cart_items
    ADD CONSTRAINT uk_customer_cart_items_customer_id_service_id UNIQUE (customer_id, service_id);


--
-- Name: devices uk_devices_imei_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT uk_devices_imei_number UNIQUE (imei);


--
-- Name: devices uk_devices_sim_card_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT uk_devices_sim_card_id UNIQUE (sim_card_id);


--
-- Name: files uk_files_s3_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT uk_files_s3_key UNIQUE (s3_key);


--
-- Name: order_items uk_order_items_order_id_service_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT uk_order_items_order_id_service_id UNIQUE (order_id, service_id);


--
-- Name: permissions uk_permissions_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT uk_permissions_code UNIQUE (code);


--
-- Name: roles uk_roles_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uk_roles_name UNIQUE (name);


--
-- Name: sim_cards uk_sim_cards_imsi_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_cards
    ADD CONSTRAINT uk_sim_cards_imsi_number UNIQUE (imsi_number);


--
-- Name: sim_cards uk_sim_cards_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_cards
    ADD CONSTRAINT uk_sim_cards_number UNIQUE (number);


--
-- Name: sim_plans uk_sim_plans_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_plans
    ADD CONSTRAINT uk_sim_plans_name UNIQUE (name);


--
-- Name: states uk_states_gst_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT uk_states_gst_code UNIQUE (gst_code);


--
-- Name: states uk_states_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT uk_states_name UNIQUE (name);


--
-- Name: users uk_users_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_users_email UNIQUE (email);


--
-- Name: users uk_users_phone_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_users_phone_number UNIQUE (phone_number);


--
-- Name: wards uk_wards_zone_id_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT uk_wards_zone_id_name UNIQUE (zone_id, name);


--
-- Name: zones uk_zones_fire_station_id_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT uk_zones_fire_station_id_name UNIQUE (fire_station_id, name);


--
-- Name: idx_dealers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dealers_email ON public.dealers USING btree (email);


--
-- Name: idx_dealers_pan_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dealers_pan_number ON public.dealers USING btree (pan_number);


--
-- Name: idx_dealers_phone_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dealers_phone_number ON public.dealers USING btree (phone_number);


--
-- Name: idx_dealers_promo_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dealers_promo_code ON public.dealers USING btree (promo_code);


--
-- Name: idx_devices_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_brand ON public.devices USING btree (brand);


--
-- Name: idx_devices_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_location ON public.devices USING btree (latitude, longitude);


--
-- Name: idx_devices_occupancy_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_occupancy_type ON public.devices USING btree (occupancy_type);


--
-- Name: uk_dealers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uk_dealers_email ON public.dealers USING btree (email);


--
-- Name: uk_dealers_pan_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uk_dealers_pan_number ON public.dealers USING btree (pan_number);


--
-- Name: uk_dealers_phone_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uk_dealers_phone_number ON public.dealers USING btree (phone_number);


--
-- Name: uk_dealers_promo_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uk_dealers_promo_code ON public.dealers USING btree (promo_code);


--
-- Name: uk_devices_sim_card_id_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uk_devices_sim_card_id_device_id ON public.devices USING btree (sim_card_id, id) WHERE (sim_card_id IS NOT NULL);


--
-- Name: calibrations fk_calibrations_device_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calibrations
    ADD CONSTRAINT fk_calibrations_device_id FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: customer_cart_items fk_customer_cart_items_customer_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_cart_items
    ADD CONSTRAINT fk_customer_cart_items_customer_id FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_cart_items fk_customer_cart_items_service_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_cart_items
    ADD CONSTRAINT fk_customer_cart_items_service_id FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: dealer_transactions fk_dealer_transactions_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealer_transactions
    ADD CONSTRAINT fk_dealer_transactions_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: dealer_transactions fk_dealer_transactions_dealer_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealer_transactions
    ADD CONSTRAINT fk_dealer_transactions_dealer_id FOREIGN KEY (dealer_id) REFERENCES public.dealers(id);


--
-- Name: dealer_transactions fk_dealer_transactions_dealer_withdraw_request_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealer_transactions
    ADD CONSTRAINT fk_dealer_transactions_dealer_withdraw_request_id FOREIGN KEY (dealer_withdraw_request_id) REFERENCES public.dealer_withdraw_requests(id);


--
-- Name: dealer_transactions fk_dealer_transactions_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealer_transactions
    ADD CONSTRAINT fk_dealer_transactions_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: dealer_withdraw_requests fk_dealer_withdraw_requests_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealer_withdraw_requests
    ADD CONSTRAINT fk_dealer_withdraw_requests_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: dealer_withdraw_requests fk_dealer_withdraw_requests_dealer_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealer_withdraw_requests
    ADD CONSTRAINT fk_dealer_withdraw_requests_dealer_id FOREIGN KEY (dealer_id) REFERENCES public.dealers(id);


--
-- Name: dealer_withdraw_requests fk_dealer_withdraw_requests_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealer_withdraw_requests
    ADD CONSTRAINT fk_dealer_withdraw_requests_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: dealers fk_dealers_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT fk_dealers_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: dealers fk_dealers_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT fk_dealers_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: device_alerts fk_device_alerts_device_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_alerts
    ADD CONSTRAINT fk_device_alerts_device_id FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: devices fk_devices_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_devices_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: devices fk_devices_customer_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_devices_customer_id FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: devices fk_devices_noc_file_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_devices_noc_file_id FOREIGN KEY (noc_file_id) REFERENCES public.files(id);


--
-- Name: devices fk_devices_order_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_devices_order_id FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: devices fk_devices_service_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_devices_service_id FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: devices fk_devices_sim_card_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_devices_sim_card_id FOREIGN KEY (sim_card_id) REFERENCES public.sim_cards(id);


--
-- Name: devices fk_devices_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_devices_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: devices fk_devices_ward_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_devices_ward_id FOREIGN KEY (ward_id) REFERENCES public.wards(id);


--
-- Name: fire_stations fk_fire_stations_state_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fire_stations
    ADD CONSTRAINT fk_fire_stations_state_id FOREIGN KEY (state_id) REFERENCES public.states(id);


--
-- Name: order_items fk_order_items_order_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items fk_order_items_service_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_service_id FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: order_status_logs fk_order_status_logs_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_logs
    ADD CONSTRAINT fk_order_status_logs_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: order_status_logs fk_order_status_logs_order_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_logs
    ADD CONSTRAINT fk_order_status_logs_order_id FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: orders fk_orders_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: orders fk_orders_customer_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_customer_id FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: orders fk_orders_dealer_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_dealer_id FOREIGN KEY (dealer_id) REFERENCES public.dealers(id);


--
-- Name: orders fk_orders_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: service_images fk_product_images_file_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_images
    ADD CONSTRAINT fk_product_images_file_id FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: services fk_products_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: services fk_products_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_products_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: role_permissions fk_role_permissions_permission_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: role_permissions fk_role_permissions_role_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_role_id FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: service_images fk_service_images_service_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_images
    ADD CONSTRAINT fk_service_images_service_id FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: sim_cards fk_sim_cards_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_cards
    ADD CONSTRAINT fk_sim_cards_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sim_cards fk_sim_cards_sim_plan_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_cards
    ADD CONSTRAINT fk_sim_cards_sim_plan_id FOREIGN KEY (sim_plan_id) REFERENCES public.sim_plans(id);


--
-- Name: sim_cards fk_sim_cards_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_cards
    ADD CONSTRAINT fk_sim_cards_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: sim_plans fk_sim_plans_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_plans
    ADD CONSTRAINT fk_sim_plans_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sim_plans fk_sim_plans_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sim_plans
    ADD CONSTRAINT fk_sim_plans_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: user_device_mapping fk_user_device_mapping_device_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_device_mapping
    ADD CONSTRAINT fk_user_device_mapping_device_id FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: user_device_mapping fk_user_device_mapping_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_device_mapping
    ADD CONSTRAINT fk_user_device_mapping_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_sessions fk_user_sessions_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_roles fk_users_roles_role_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_users_roles_role_id FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: user_roles fk_users_roles_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_users_roles_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: wards fk_wards_zone_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT fk_wards_zone_id FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- Name: zones fk_zones_fire_station_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT fk_zones_fire_station_id FOREIGN KEY (fire_station_id) REFERENCES public.fire_stations(id) ON DELETE CASCADE;





-- migrate:down

