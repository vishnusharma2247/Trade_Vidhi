import { relations } from "drizzle-orm";

export { users, userDevices } from "./users";
export { stocks } from "./stocks";
export { recommendations, recommendationActions } from "./recommendations";
export { portfolios, holdings } from "./portfolios";
export { transactions } from "./transactions";
export { watchlists, watchlistItems } from "./watchlists";
export { notifications } from "./notifications";
export { auditLogs, appSettings } from "./audit";
export { plans, subscriptions } from "./subscriptions";

import { users, userDevices } from "./users";
import { stocks } from "./stocks";
import { recommendations, recommendationActions } from "./recommendations";
import { portfolios, holdings } from "./portfolios";
import { transactions } from "./transactions";
import { watchlists, watchlistItems } from "./watchlists";
import { notifications } from "./notifications";
import { auditLogs } from "./audit";
import { plans, subscriptions } from "./subscriptions";

// ─── User Relations ─────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  devices: many(userDevices),
  portfolios: many(portfolios),
  holdings: many(holdings),
  transactions: many(transactions),
  watchlists: many(watchlists),
  notifications: many(notifications),
  recommendationActions: many(recommendationActions),
  createdRecommendations: many(recommendations),
  subscriptions: many(subscriptions),
  auditLogs: many(auditLogs),
}));

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
}));

// ─── Stock Relations ────────────────────────────────────────────────────────

export const stocksRelations = relations(stocks, ({ many }) => ({
  recommendations: many(recommendations),
  holdings: many(holdings),
  watchlistItems: many(watchlistItems),
  transactions: many(transactions),
}));

// ─── Recommendation Relations ───────────────────────────────────────────────

export const recommendationsRelations = relations(
  recommendations,
  ({ one, many }) => ({
    stock: one(stocks, {
      fields: [recommendations.stockId],
      references: [stocks.id],
    }),
    creator: one(users, {
      fields: [recommendations.createdBy],
      references: [users.id],
    }),
    actions: many(recommendationActions),
    holdings: many(holdings),
    transactions: many(transactions),
  })
);

export const recommendationActionsRelations = relations(
  recommendationActions,
  ({ one }) => ({
    user: one(users, {
      fields: [recommendationActions.userId],
      references: [users.id],
    }),
    recommendation: one(recommendations, {
      fields: [recommendationActions.recommendationId],
      references: [recommendations.id],
    }),
  })
);

// ─── Portfolio Relations ────────────────────────────────────────────────────

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  holdings: many(holdings),
  transactions: many(transactions),
}));

export const holdingsRelations = relations(holdings, ({ one, many }) => ({
  portfolio: one(portfolios, {
    fields: [holdings.portfolioId],
    references: [portfolios.id],
  }),
  user: one(users, {
    fields: [holdings.userId],
    references: [users.id],
  }),
  stock: one(stocks, {
    fields: [holdings.stockId],
    references: [stocks.id],
  }),
  recommendation: one(recommendations, {
    fields: [holdings.recommendationId],
    references: [recommendations.id],
  }),
  transactions: many(transactions),
}));

// ─── Transaction Relations ──────────────────────────────────────────────────

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  portfolio: one(portfolios, {
    fields: [transactions.portfolioId],
    references: [portfolios.id],
  }),
  holding: one(holdings, {
    fields: [transactions.holdingId],
    references: [holdings.id],
  }),
  stock: one(stocks, {
    fields: [transactions.stockId],
    references: [stocks.id],
  }),
  recommendation: one(recommendations, {
    fields: [transactions.recommendationId],
    references: [recommendations.id],
  }),
}));

// ─── Watchlist Relations ────────────────────────────────────────────────────

export const watchlistsRelations = relations(watchlists, ({ one, many }) => ({
  user: one(users, {
    fields: [watchlists.userId],
    references: [users.id],
  }),
  items: many(watchlistItems),
}));

export const watchlistItemsRelations = relations(
  watchlistItems,
  ({ one }) => ({
    watchlist: one(watchlists, {
      fields: [watchlistItems.watchlistId],
      references: [watchlists.id],
    }),
    stock: one(stocks, {
      fields: [watchlistItems.stockId],
      references: [stocks.id],
    }),
  })
);

// ─── Notification Relations ─────────────────────────────────────────────────

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// ─── Audit Relations ────────────────────────────────────────────────────────

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

// ─── Subscription Relations ─────────────────────────────────────────────────

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));
