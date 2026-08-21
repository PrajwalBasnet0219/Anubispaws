-- AnubisPaws PostgreSQL schema (Neon / Vercel Postgres)
-- Run this ONCE on your Neon database, e.g.:
--   psql "<YOUR_NEON_CONNECTION_STRING>" -f src/db/postgres-schema.sql
-- or paste it into the Neon SQL Editor.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  role VARCHAR(32) DEFAULT 'pet_owner',
  isVerified BOOLEAN DEFAULT FALSE,
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(255) NOT NULL,
  breed VARCHAR(255),
  age INT,
  gender VARCHAR(32),
  description TEXT,
  status VARCHAR(32) DEFAULT 'available',
  image_url TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  owner_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(255),
  stock INT NOT NULL DEFAULT 0,
  weight NUMERIC(10,2) DEFAULT 0,
  image_url TEXT,
  total_sold INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  order_pets TEXT,          -- JSON string: [{"id":1}]
  order_products TEXT,      -- JSON string: [{"id":2,"quantity":3}]
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(32) DEFAULT 'pending',
  shipping_address TEXT,
  payment_method VARCHAR(32),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  contact_phone VARCHAR(32),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(32),
  payment_status VARCHAR(32) DEFAULT 'PENDING',
  khalti_pidx VARCHAR(255),
  khalti_transaction_id VARCHAR(255),
  esewa_transaction_uuid VARCHAR(255),
  esewa_ref_id VARCHAR(255),
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  user_phone VARCHAR(32),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  -- legacy table; current code stores items as JSON on orders.
  -- kept only so old profile queries do not crash if called.
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR(16),
  item_id INT,
  price NUMERIC(10,2) DEFAULT 0,
  quantity INT DEFAULT 1,
  status VARCHAR(32)
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
