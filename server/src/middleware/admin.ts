import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../app.js";

export const adminMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const role = c.get("userRole");

  if (role !== "admin") {
    throw new HTTPException(403, { message: "Admin access required" });
  }

  await next();
};
