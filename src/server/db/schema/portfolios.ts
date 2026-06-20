import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  decimal,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { stocks } from "./stocks";
import { recommendations } from "./recommendations";

export const portfolios = pgTable(
  "portfolios",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    name: varchar("name", { length: 100 }).default("My Portfolio").notNull(),
    isDefault: boolean("is_default").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_portfolios_user_name").on(table.userId, table.name),
    index("idx_portfolios_user_id").on(table.userId),
  ]
);

export const holdings = pgTable(
  "holdings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    portfolioId: uuid("portfolio_id")
      .references(() => portfolios.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    stockId: uuid("stock_id")
      .references(() => stocks.id)
      .notNull(),
    recommendationId: uuid("recommendation_id").references(
      () => recommendations.id
    ),
    quantity: decimal("quantity", { precision: 12, scale: 4 }).notNull(),
    avgBuyPrice: decimal("avg_buy_price", { precision: 12, scale: 2 }).notNull(),
    investedAmount: decimal("invested_amount", {
      precision: 14,
      scale: 2,
    }).notNull(),
    status: varchar("status", { length: 20 }).default("open").notNull(),
    openedAt: timestamp("opened_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_holdings_user_id").on(table.userId),
    index("idx_holdings_portfolio_id").on(table.portfolioId),
    index("idx_holdings_stock_id").on(table.stockId),
    index("idx_holdings_open").on(table.userId, table.status).where(
      sql`status = 'open'`
    ),
    index("idx_holdings_portfolio_status").on(table.portfolioId, table.status),
  ]
);
