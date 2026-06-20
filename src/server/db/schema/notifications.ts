import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body").notNull(),
    data: jsonb("data"),
    referenceType: varchar("reference_type", { length: 50 }),
    referenceId: uuid("reference_id"),
    isRead: boolean("is_read").default(false).notNull(),
    isSent: boolean("is_sent").default(false).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_notifications_user_unread").on(
      table.userId,
      table.createdAt
    ).where(sql`is_read = false`),
    index("idx_notifications_unsent").on(table.createdAt).where(
      sql`is_sent = false`
    ),
    index("idx_notifications_user_id").on(table.userId),
    index("idx_notifications_reference").on(
      table.referenceType,
      table.referenceId
    ),
  ]
);
