import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { stocks } from "./stocks";

export const watchlists = pgTable(
  "watchlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    name: varchar("name", { length: 100 }).default("Default").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_watchlists_user_name").on(table.userId, table.name),
    index("idx_watchlists_user_id").on(table.userId),
  ]
);

export const watchlistItems = pgTable(
  "watchlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    watchlistId: uuid("watchlist_id")
      .references(() => watchlists.id, { onDelete: "cascade" })
      .notNull(),
    stockId: uuid("stock_id")
      .references(() => stocks.id)
      .notNull(),
    addedAt: timestamp("added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_watchlist_items_unique").on(
      table.watchlistId,
      table.stockId
    ),
    index("idx_watchlist_items_watchlist").on(table.watchlistId),
  ]
);
