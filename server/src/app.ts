import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { routes } from "./routes/index.js";

export type AppEnv = {
  Variables: {
    userId: string;
    userRole: string;
  };
};

const app = new Hono<AppEnv>();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.onError(errorHandler);

app.route("/", routes);

export { app };
