import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { stocks } from "./stocks";

export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stockId: uuid("stock_id")
      .references(() => stocks.id)
      .notNull(),
    createdBy: uuid("created_by")
      .references(() => users.id)
      .notNull(),
    action: varchar("action", { length: 10 }).notNull(),
    entryPrice: decimal("entry_price", { precision: 12, scale: 2 }).notNull(),
    targetPrice: decimal("target_price", { precision: 12, scale: 2 }).notNull(),
    stopLoss: decimal("stop_loss", { precision: 12, scale: 2 }).notNull(),
    riskLevel: varchar("risk_level", { length: 10 }).notNull(),
    rationale: text("rationale").notNull(),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    horizon: varchar("horizon", { length: 20 }).default("short"),
    exitPrice: decimal("exit_price", { precision: 12, scale: 2 }),
    exitReason: text("exit_reason"),
    pnlPercentage: decimal("pnl_percentage", { precision: 8, scale: 2 }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_recommendations_status").on(table.status),
    index("idx_recommendations_stock_id").on(table.stockId),
    index("idx_recommendations_published_at").on(table.publishedAt),
    index("idx_recommendations_active").on(table.publishedAt).where(
      sql`status = 'active'`
    ),
  ]
);

export const recommendationActions = pgTable(
  "recommendation_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    recommendationId: uuid("recommendation_id")
      .references(() => recommendations.id)
      .notNull(),
    action: varchar("action", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_rec_actions_unique").on(
      table.userId,
      table.recommendationId,
      table.action
    ),
    index("idx_rec_actions_user").on(table.userId),
    index("idx_rec_actions_recommendation").on(table.recommendationId),
  ]
);
