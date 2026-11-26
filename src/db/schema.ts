import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// 1. Better Auth Core Tables + Sobji User Fields
// ==========================================
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("customer"), // 'customer' | 'admin'
  phone: text("phone"),
  isMember: boolean("is_member").notNull().default(false),
  memberSince: timestamp("member_since"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// 2. Sobji Catalog & Traceability Tables
// ==========================================
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionBn: text("description_bn").notNull(),
  iconName: text("icon_name").notNull().default("leaf"),
  accentColor: text("accent_color").notNull().default("#166534"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const farmers = pgTable("farmers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn").notNull(),
  district: text("district").notNull(),
  upazila: text("upazila").notNull(),
  specialty: text("specialty").notNull(),
  yearsActive: integer("years_active").notNull().default(8),
  verified: boolean("verified").notNull().default(true),
  storyEn: text("story_en").notNull(),
  storyBn: text("story_bn").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  farmerId: integer("farmer_id")
    .notNull()
    .references(() => farmers.id, { onDelete: "restrict" }),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull(),
  subtitleEn: text("subtitle_en").notNull(),
  subtitleBn: text("subtitle_bn").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionBn: text("description_bn").notNull(),
  visualKey: text("visual_key").notNull().default("default"),
  imageUrl: text("image_url"),
  badge: text("badge").notNull().default("Farm Direct"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isFlashDeal: boolean("is_flash_deal").notNull().default(false),
  isMemberBogo: boolean("is_member_bogo").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  harvestTime: text("harvest_time").notNull().default("Today, 5:15 AM"),
  storageTipEn: text("storage_tip_en").notNull(),
  storageTipBn: text("storage_tip_bn").notNull(),
  ratingAvg: doublePrecision("rating_avg").notNull().default(4.8),
  reviewCount: integer("review_count").notNull().default(12),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  priceBdt: integer("price_bdt").notNull(),
  compareAtBdt: integer("compare_at_bdt"),
  stockQty: integer("stock_qty").notNull().default(50),
  isDefault: boolean("is_default").notNull().default(false),
});

// ==========================================
// 3. Logistics, Coupons & Checkout Tables
// ==========================================
export const deliverySlots = pgTable("delivery_slots", {
  id: serial("id").primaryKey(),
  labelEn: text("label_en").notNull(),
  labelBn: text("label_bn").notNull(),
  windowText: text("window_text").notNull(),
  isExpress: boolean("is_express").notNull().default(false),
  capacity: integer("capacity").notNull().default(80),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull().default("percent"), // 'percent' | 'fixed'
  discountValue: integer("discount_value").notNull(),
  minOrderBdt: integer("min_order_bdt").notNull().default(300),
  maxDiscountBdt: integer("max_discount_bdt"),
  descriptionEn: text("description_en").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  deliveryArea: text("delivery_area").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryNotes: text("delivery_notes"),
  slotId: integer("slot_id").references(() => deliverySlots.id, {
    onDelete: "set null",
  }),
  slotLabel: text("slot_label").notNull(),
  deliveryDate: text("delivery_date").notNull(),
  paymentMethod: text("payment_method").notNull().default("cod"), // 'cod' | 'bkash' | 'nagad' | 'card'
  paymentStatus: text("payment_status").notNull().default("pending"), // 'pending' | 'paid'
  paymentRef: text("payment_ref"),
  status: text("status").notNull().default("confirmed"), // 'pending' | 'confirmed' | 'harvesting' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
  subtotalBdt: integer("subtotal_bdt").notNull(),
  discountBdt: integer("discount_bdt").notNull().default(0),
  deliveryFeeBdt: integer("delivery_fee_bdt").notNull().default(0),
  totalBdt: integer("total_bdt").notNull(),
  couponCode: text("coupon_code"),
  isRecurringWeekly: boolean("is_recurring_weekly").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  variantId: integer("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  productNameEn: text("product_name_en").notNull(),
  productNameBn: text("product_name_bn").notNull(),
  variantLabel: text("variant_label").notNull(),
  visualKey: text("visual_key").notNull().default("default"),
  unitPriceBdt: integer("unit_price_bdt").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotalBdt: integer("line_total_bdt").notNull(),
});

// ==========================================
// 4. Community Reviews, Saved Addresses & Weekly Bazar Subscriptions
// ==========================================
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  verifiedPurchase: boolean("verified_purchase").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  area: text("area").notNull(),
  fullAddress: text("full_address").notNull(),
  phone: text("phone").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  frequency: text("frequency").notNull().default("weekly"),
  preferredSlot: text("preferred_slot").notNull(),
  deliveryArea: text("delivery_area").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  itemsJson: jsonb("items_json").notNull(),
  totalBdt: integer("total_bdt").notNull(),
  status: text("status").notNull().default("active"), // 'active' | 'paused'
  nextDeliveryDate: text("next_delivery_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==========================================
// Drizzle Relations
// ==========================================
export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const farmerRelations = relations(farmers, ({ many }) => ({
  products: many(products),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  farmer: one(farmers, {
    fields: [products.farmerId],
    references: [farmers.id],
  }),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const variantRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const orderRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));
