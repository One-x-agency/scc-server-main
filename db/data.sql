
-- insert root user

insert into users
  (is_root_user, name, phone_number, email, password_hash)
values
  (true, 'Root', '1234567890', 'root@ullasindia.com', '$2b$07$ld3otBu3bsxG7ICLIldQ8OYfFkhgYzt1vPXavb3tLbKRFg9fVtNOS');


-- insert permissions

insert into permissions (code, name, description) values
('sim_card.read', 'Sim Card Read', 'Read Sim Card'),
('sim_card.create', 'Sim Card Create', 'Create Sim Card'),
('sim_card.update', 'Sim Card Update', 'Update Sim Card'),
('sim_card.delete', 'Sim Card Delete', 'Delete Sim Card'),
('sim_plan.read', 'Sim Plan Read', 'Read Sim Plan'),
('sim_plan.create', 'Sim Plan Create', 'Create Sim Plan'),
('sim_plan.update', 'Sim Plan Update', 'Update Sim Plan'),
('sim_plan.delete', 'Sim Plan Delete', 'Delete Sim Plan'),
('device.create', 'Device Create', 'Create Device'),
('device.update', 'Device Update', 'Update Device'),
('device.delete', 'Device Delete', 'Delete Device');

insert into permissions (code, name, description, access_level)
values
  ('sim_card', 'SIM Card Module', 'Access to the SIM card module', 3),
  ('sim_plan', 'SIM Plan Module', 'Access to the SIM plan module', 3);

insert into permissions (code, name, description, access_level)
values
  ('location', 'district,city,zone,ward module', 'Access to the District, City, Zone, Ward.', 3),
  ('device', 'device module', 'Access to the device module', 3),
  ('device_configuration', 'device configuration module', 'Access to device ping mapping and calibrations', 2),
  ('customer', 'customer module', 'Access to the customer module',1);


insert into permissions (code, name, description, access_level)
values
  ('inquiry', 'inquiry module', 'Access to the inquiry module', 3);

insert into permissions (code, name, description, access_level)
values
  ('calibration', 'calibration module', 'Access to the calibration module', 3);


insert into permissions (code, name, description, access_level)
values
  ('order', 'Order Module', 'Access to the Order module' , 3);

insert into permissions (code, name, description, access_level) values ('dealer', 'Dealer Module', 'Access to the Dealer module', 3);



insert into permissions (code, name, description, access_level)
values
  ('report', 'report module', 'Access to the report module', 1);


-- insert services
insert into products (id,name,price,description)
values
('aefe0065-0863-4071-bac3-f700c93ccedd', 'Aalrt', 1000, 'Aalrt'),
('5d57d45f-ef46-47cb-bc57-47a08cfc19f0', 'Aalrt +', 1500, 'Aalrt +'),
('b3208093-f776-4856-97ef-4208ab337d31', 'aalrt safe', 2000, 'aalrt safe'),
('f0b6e1ec-b705-4ce3-8c06-21d302505c86', 'aalrt advance', 2500, 'aalrt advance');

insert into files (id, s3_key, url)
values
('ed33fbc8-f943-4059-ac35-a07338f8e759', 'public/product-images/c6063f4d-d7c0-4280-af7f-4e30fa42725f.png', 'https://aalrt.s3.ap-south-1.amazonaws.com/public/product-images/c6063f4d-d7c0-4280-af7f-4e30fa42725f.png'),
('d2c742b2-2637-4dfe-8c2f-ddb58f07a86d', 'public/product-images/be886366-2015-4614-8a49-26c95cd9bae2.png', 'https://aalrt.s3.ap-south-1.amazonaws.com/public/product-images/be886366-2015-4614-8a49-26c95cd9bae2.png'),
('2dfbe899-d707-4cab-b89e-ebbd60edb842', 'public/product-images/fa59de00-17a7-43b2-94df-383e5da35d89.png', 'https://aalrt.s3.ap-south-1.amazonaws.com/public/product-images/fa59de00-17a7-43b2-94df-383e5da35d89.png'),
('af675e0b-3978-4891-8055-7b25092cb866', 'public/product-images/70a5e029-c601-4972-bdc2-baeb226620ec.png', 'https://aalrt.s3.ap-south-1.amazonaws.com/public/product-images/70a5e029-c601-4972-bdc2-baeb226620ec.png');


insert into product_images (product_id, file_id)
values
('aefe0065-0863-4071-bac3-f700c93ccedd', 'ed33fbc8-f943-4059-ac35-a07338f8e759'),
('5d57d45f-ef46-47cb-bc57-47a08cfc19f0', 'd2c742b2-2637-4dfe-8c2f-ddb58f07a86d'),
('b3208093-f776-4856-97ef-4208ab337d31', '2dfbe899-d707-4cab-b89e-ebbd60edb842'),
('f0b6e1ec-b705-4ce3-8c06-21d302505c86', 'af675e0b-3978-4891-8055-7b25092cb866');


-- insert states

insert into states (name, gst_code, is_union_territory) values
  ('Jammu and Kashmir', '01', true),
  ('Himachal Pradesh', '02', false),
  ('Punjab', '03', false),
  ('Chandigarh', '04', true),
  ('Uttarakhand', '05', false),
  ('Haryana', '06', false),
  ('Delhi', '07', true),
  ('Rajasthan', '08', false),
  ('Uttar Pradesh', '09', false),
  ('Bihar', '10', false),
  ('Sikkim', '11', false),
  ('Arunachal Pradesh', '12', false),
  ('Nagaland', '13', false),
  ('Manipur', '14', false),
  ('Mizoram', '15', false),
  ('Tripura', '16', false),
  ('Meghalaya', '17', false),
  ('Assam', '18', false),
  ('West Bengal', '19', false),
  ('Jharkhand', '20', false),
  ('Odisha', '21', false),
  ('Chhattisgarh', '22', false),
  ('Madhya Pradesh', '23', false),
  ('Gujarat', '24', false),
  ('Daman and Diu', '25', true),
  ('Dadra and Nagar Haveli', '26', true),
  ('Maharashtra', '27', false),
  ('Karnataka', '29', false),
  ('Goa', '30', false),
  ('Lakshadweep', '31', true),
  ('Kerala', '32', false),
  ('Tamil Nadu', '33', false),
  ('Puducherry', '34', true),
  ('Andaman and Nicobar', '35', true),
  ('Telangana', '36', false),
  ('Andhra Pradesh', '37', false),
  ('Ladakh', '38', true);
