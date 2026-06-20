import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 50 }).unique().notNull(),
    description: text("description"),
    priceMonthly: decimal("price_monthly", {
      precision: 10,
      scale: 2,
    }).notNull(),
    priceYearly: decimal("price_yearly", { precision: 10, scale: 2 }),
    features: jsonb("features").notNull(),
    maxRecommendations: integer("max_recommendations"),
    maxWatchlistStocks: integer("max_watchlist_stocks"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("idx_plans_slug").on(table.slug)]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    planId: uuid("plan_id")
      .references(() => plans.id)
      .notNull(),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    paymentProvider: varchar("payment_provider", { length: 30 }),
    providerSubscriptionId: varchar("provider_subscription_id", {
      length: 255,
    }),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }).notNull(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_subscriptions_user_id").on(table.userId),
    index("idx_subscriptions_active").on(table.userId).where(
      sql`status = 'active'`
    ),
    index("idx_subscriptions_plan_id").on(table.planId),
  ]
);
