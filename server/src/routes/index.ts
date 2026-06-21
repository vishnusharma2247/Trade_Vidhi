import { Hono } from "hono";
import type { AppEnv } from "../app.js";
import { health } from "./health.js";
import { usersRoute } from "./users.js";
import { recommendationsRoute } from "./recommendations.js";
import { transactionsRoute } from "./transactions.js";
import { portfolioRoute } from "./portfolio.js";
import { watchlistRoute } from "./watchlist.js";
import { notificationsRoute } from "./notifications.js";
import { stocksRoute } from "./stocks.js";
import { clerkWebhook } from "./webhooks/clerk.js";
import { authMiddleware } from "../middleware/auth.js";

const routes = new Hono<AppEnv>();

routes.route("/", health);

routes.route("/webhooks", clerkWebhook);

routes.use("/api/v1/*", authMiddleware);

routes.route("/api/v1", usersRoute);
routes.route("/api/v1", recommendationsRoute);
routes.route("/api/v1", transactionsRoute);
routes.route("/api/v1", portfolioRoute);
routes.route("/api/v1", watchlistRoute);
routes.route("/api/v1", notificationsRoute);
routes.route("/api/v1", stocksRoute);

export { routes };
