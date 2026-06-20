import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { stocks } from "./stocks";
import { portfolios, holdings } from "./portfolios";
import { recommendations } from "./recommendations";

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    portfolioId: uuid("portfolio_id")
      .references(() => portfolios.id)
      .notNull(),
    holdingId: uuid("holding_id").references(() => holdings.id),
    stockId: uuid("stock_id")
      .references(() => stocks.id)
      .notNull(),
    recommendationId: uuid("recommendation_id").references(
      () => recommendations.id
    ),
    type: varchar("type", { length: 10 }).notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 4 }).notNull(),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 14, scale: 2 }).notNull(),
    fees: decimal("fees", { precision: 10, scale: 2 }).default("0"),
    netAmount: decimal("net_amount", { precision: 14, scale: 2 }).notNull(),
    brokerOrderId: varchar("broker_order_id", { length: 100 }),
    brokerStatus: varchar("broker_status", { length: 30 }),
    executionType: varchar("execution_type", { length: 20 }).default("manual"),
    notes: text("notes"),
    executedAt: timestamp("executed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_transactions_user_id").on(table.userId),
    index("idx_transactions_user_time").on(table.userId, table.executedAt),
    index("idx_transactions_stock_id").on(table.stockId),
    index("idx_transactions_portfolio_id").on(table.portfolioId),
    index("idx_transactions_holding_id").on(table.holdingId),
    index("idx_transactions_broker_order").on(table.brokerOrderId),
  ]
);
