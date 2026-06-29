import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

// Users table (mirrors Firebase Auth and some Firestore data for relational queries)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Firebase UID
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community Posts / User Posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin Managed Stuffs (e.g., Site Metadata, Featured Collections)
export const siteConfig = pgTable("site_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products (Relational version for complex filtering/admin stats)
export const products = pgTable("products", {
  id: text("id").primaryKey(), // Matches Firestore ID
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // In cents
  category: text("category").notNull(),
  stock: integer("stock").default(0).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
