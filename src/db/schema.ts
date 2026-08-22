import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  char,
} from "drizzle-orm/pg-core";

// Mirrors src/db/postgres-schema.sql - keep both files in sync.
// NOTE: column names here MUST match the live Neon DB exactly
// (e.g. "isverified" is all-lowercase because the table was created
// with an unquoted camelCase name, which Postgres folds to lowercase).

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role").default("pet_owner"),
  isverified: boolean("isverified").default(false),
  google_id: text("google_id").unique(),
  created_at: timestamp("created_at").defaultNow(),
});

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  age: integer("age"),
  gender: text("gender"),
  description: text("description"),
  status: text("status").default("available"),
  image_url: text("image_url"),
  price: numeric("price", { precision: 10, scale: 2 }).default("0"),
  owner_id: integer("owner_id").references(() => users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  category: text("category"),
  stock: integer("stock").notNull().default(0),
  weight: numeric("weight", { precision: 10, scale: 2 }).default("0"),
  image_url: text("image_url"),
  total_sold: integer("total_sold").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  order_pets: text("order_pets"), // JSON string: [{"id":1}]
  order_products: text("order_products"), // JSON string: [{"id":2,"quantity":3}]
  total_amount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").default("pending"),
  shipping_address: text("shipping_address"),
  payment_method: text("payment_method"),
  customer_name: text("customer_name"),
  customer_email: text("customer_email"),
  contact_phone: text("contact_phone"),
  created_at: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  payment_method: text("payment_method"),
  payment_status: text("payment_status").default("PENDING"),
  khalti_pidx: text("khalti_pidx"),
  khalti_transaction_id: text("khalti_transaction_id"),
  esewa_transaction_uuid: text("esewa_transaction_uuid"),
  esewa_ref_id: text("esewa_ref_id"),
  user_email: text("user_email"),
  user_name: text("user_name"),
  user_phone: text("user_phone"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  token_hash: char("token_hash", { length: 64 }).notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Legacy table - current code stores items as JSON on orders.
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  item_type: text("item_type"),
  item_id: integer("item_id"),
  price: numeric("price", { precision: 10, scale: 2 }).default("0"),
  quantity: integer("quantity").default(1),
  status: text("status"),
});
