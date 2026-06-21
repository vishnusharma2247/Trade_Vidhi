import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";

import { users, userDevices } from "../../../db/schema/users.js";
import { stocks } from "../../../db/schema/stocks.js";
import { recommendations, recommendationActions } from "../../../db/schema/recommendations.js";
import { portfolios, holdings } from "../../../db/schema/portfolios.js";
import { transactions } from "../../../db/schema/transactions.js";
import { watchlists, watchlistItems } from "../../../db/schema/watchlists.js";
import { notifications } from "../../../db/schema/notifications.js";
import { auditLogs, appSettings } from "../../../db/schema/audit.js";
import { plans, subscriptions } from "../../../db/schema/subscriptions.js";

export const schema = {
  users,
  userDevices,
  stocks,
  recommendations,
  recommendationActions,
  portfolios,
  holdings,
  transactions,
  watchlists,
  watchlistItems,
  notifications,
  auditLogs,
  appSettings,
  plans,
  subscriptions,
};

const client = postgres(env.DATABASE_URL, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });
