-- ============================================================
-- AGRAWAL ENTERPRISE — SUPABASE SCHEMA
-- Run this in the Supabase SQL editor to set up your database.
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- =====================
-- REFERENCE / LOOKUP TABLES
-- =====================

create table if not exists categories (
  id serial primary key,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subcategories (
  id serial primary key,
  category_id int not null references categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table categories add column if not exists image text;
alter table subcategories add column if not exists image text;

create table if not exists brands (
  id serial primary key,
  name text not null,
  slug text not null unique,
  logo text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sizes (
  id serial primary key,
  name text not null unique,
  sort_order int not null default 0
);

create table if not exists colors (
  id serial primary key,
  name text not null unique,
  hex_code text
);

-- =====================
-- PRODUCTS
-- =====================

create table if not exists products (
  id serial primary key,
  category_id int not null references categories(id),
  subcategory_id int references subcategories(id),
  brand_id int references brands(id),
  name text not null,
  gender text not null default 'Unisex' check (gender in ('Men','Women','Kids','Unisex')),
  slug text not null unique,
  model_no text,
  description text,
  sku text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_sizes (
  id serial primary key,
  product_id int not null references products(id) on delete cascade,
  size_id int not null references sizes(id),
  price numeric(10,2) not null,
  mrp numeric(10,2) not null,
  sku text,
  is_active boolean not null default true,
  unique(product_id, size_id)
);

create table if not exists product_colors (
  id serial primary key,
  product_id int not null references products(id) on delete cascade,
  color_id int not null references colors(id),
  unique(product_id, color_id)
);

create table if not exists product_images (
  id serial primary key,
  product_id int not null references products(id) on delete cascade,
  color_id int references colors(id),
  image_url text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- =====================
-- INVENTORY
-- =====================

create table if not exists inventory (
  id serial primary key,
  product_id int not null references products(id) on delete cascade,
  product_size_id int not null references product_sizes(id) on delete cascade,
  product_color_id int references product_colors(id),
  quantity int not null default 0,
  reserved_quantity int not null default 0,
  reorder_level int not null default 10,
  warehouse_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- USERS (extends Supabase Auth)
-- =====================

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- ADDRESSES
-- =====================

create table if not exists addresses (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================
-- CART & WISHLIST
-- =====================

create table if not exists cart (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  product_id int not null references products(id) on delete cascade,
  product_size_id int not null references product_sizes(id),
  product_color_id int references product_colors(id),
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id, product_size_id, product_color_id)
);

create table if not exists wishlist (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  product_id int not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- =====================
-- COUPONS
-- =====================

create table if not exists coupons (
  id serial primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric(10,2) not null,
  min_order_amount numeric(10,2) not null default 0,
  max_discount_amount numeric(10,2),
  usage_limit int,
  used_count int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- =====================
-- ORDERS
-- =====================

create table if not exists orders (
  id serial primary key,
  user_id uuid not null references users(id),
  address_id int not null references addresses(id),
  coupon_id int references coupons(id),
  status text not null default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled','returned')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text,
  payment_id text,
  subtotal numeric(10,2) not null,
  discount_amount numeric(10,2) not null default 0,
  delivery_charge numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id serial primary key,
  order_id int not null references orders(id) on delete cascade,
  product_id int not null references products(id),
  product_size_id int not null references product_sizes(id),
  product_color_id int references product_colors(id),
  quantity int not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null
);

-- =====================
-- REVIEWS
-- =====================

create table if not exists reviews (
  id serial primary key,
  user_id uuid not null references users(id),
  product_id int not null references products(id) on delete cascade,
  order_item_id int references order_items(id),
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================
-- STOREFRONT VIDEOS
-- =====================

create table if not exists videos (
  id serial primary key,
  slot int not null check (slot between 1 and 3),
  video_url text not null,
  source_type text not null check (source_type in ('upload', 'url')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(slot)
);

-- =====================
-- STORAGE BUCKETS
-- (Run after creating the buckets in the Supabase dashboard)
-- =====================
-- Create three public buckets:
--   1. product-images
--   2. brand-logos
--   3. storefront-videos

-- =====================
-- RLS POLICIES (basic)
-- =====================

alter table categories enable row level security;
alter table subcategories enable row level security;
alter table brands enable row level security;
alter table sizes enable row level security;
alter table colors enable row level security;
alter table products enable row level security;
alter table product_sizes enable row level security;
alter table product_colors enable row level security;
alter table product_images enable row level security;
alter table inventory enable row level security;
alter table users enable row level security;
alter table addresses enable row level security;
alter table cart enable row level security;
alter table wishlist enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table videos enable row level security;

-- Public read for catalog
create policy "Public read categories" on categories for select using (true);
create policy "Public read subcategories" on subcategories for select using (true);
create policy "Public read brands" on brands for select using (true);
create policy "Public read sizes" on sizes for select using (true);
create policy "Public read colors" on colors for select using (true);
create policy "Public read active products" on products for select using (is_active = true);
create policy "Public read product_sizes" on product_sizes for select using (true);
create policy "Public read product_colors" on product_colors for select using (true);
create policy "Public read product_images" on product_images for select using (is_active = true);
create policy "Public read inventory" on inventory for select using (true);
create policy "Public read approved reviews" on reviews for select using (is_approved = true);

-- Users table
create policy "Users read own row" on users for select using (auth.uid() = id);
create policy "Users update own row" on users for update using (auth.uid() = id);

-- Admin policies (service role key bypasses RLS)
-- For admin operations, use the service-role key on the server,
-- or add policies that check is_admin from the users table.
create policy "Admin all categories" on categories for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all subcategories" on subcategories for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all brands" on brands for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all sizes" on sizes for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all colors" on colors for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all products" on products for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all product_sizes" on product_sizes for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all product_colors" on product_colors for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all product_images" on product_images for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all inventory" on inventory for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all orders" on orders for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all order_items" on order_items for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all users" on users for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);
create policy "Admin all reviews" on reviews for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);

-- Cart / wishlist / addresses / orders by user
create policy "User own cart" on cart for all using (auth.uid() = user_id);
create policy "User own wishlist" on wishlist for all using (auth.uid() = user_id);
create policy "User own addresses" on addresses for all using (auth.uid() = user_id);
create policy "User own orders" on orders for select using (auth.uid() = user_id);
create policy "User insert orders" on orders for insert with check (auth.uid() = user_id);
create policy "User own order_items" on order_items for select using (
  exists (select 1 from orders where id = order_items.order_id and user_id = auth.uid())
);
create policy "User write order_items" on order_items for insert with check (
  exists (select 1 from orders where id = order_items.order_id and user_id = auth.uid())
);
create policy "User own reviews" on reviews for all using (auth.uid() = user_id);
create policy "Public read coupons" on coupons for select using (is_active = true);

-- Storefront videos: public can read active videos
create policy "Public read active videos" on videos for select using (is_active = true);

-- Admin: full control over videos
create policy "Admin all videos" on videos for all using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);

-- =====================
-- SEED DATA (optional)
-- =====================

insert into sizes (name, sort_order) values
  ('XS', 1), ('S', 2), ('M', 3), ('L', 4), ('XL', 5), ('XXL', 6),
  ('2-3Y', 7), ('4-5Y', 8), ('6-7Y', 9), ('8-9Y', 10),
  ('6', 11), ('7', 12), ('8', 13), ('9', 14), ('10', 15), ('11', 16),
  ('Single', 17), ('Double', 18), ('Queen', 19), ('King', 20),
  ('One Size', 21)
on conflict (name) do nothing;

insert into colors (name, hex_code) values
  ('White', '#FFFFFF'), ('Black', '#000000'), ('Navy', '#001F5B'),
  ('Blue', '#3B82F6'), ('Red', '#EF4444'), ('Green', '#22C55E'),
  ('Yellow', '#EAB308'), ('Orange', '#F97316'), ('Pink', '#EC4899'),
  ('Grey', '#6B7280'), ('Brown', '#92400E'), ('Saffron', '#F59E0B')
on conflict (name) do nothing;

-- =====================
-- NOTIFICATIONS
-- =====================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null default 'system' check (type in (
    'order_created',
    'order_paid',
    'order_processing',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'system'
  )),
  title text not null,
  message text not null,
  entity_type text,
  entity_id bigint,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at);
create index if not exists idx_notifications_user_id_created_at on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users read own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "Users update own notifications" on public.notifications
  for update using (user_id = auth.uid());

-- =====================
-- PUSH SUBSCRIPTIONS
-- =====================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users manage own push subscriptions" on public.push_subscriptions
  for all using (user_id = auth.uid());


