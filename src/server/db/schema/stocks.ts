import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const stocks = pgTable(
  "stocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    symbol: varchar("symbol", { length: 20 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    exchange: varchar("exchange", { length: 10 }).notNull(),
    sector: varchar("sector", { length: 100 }),
    industry: varchar("industry", { length: 100 }),
    marketCap: varchar("market_cap", { length: 20 }),
    isin: varchar("isin", { length: 12 }).unique(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_stocks_symbol").on(table.symbol),
    index("idx_stocks_sector").on(table.sector),
    index("idx_stocks_exchange").on(table.exchange),
  ]
);
