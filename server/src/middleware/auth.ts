import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyToken } from "@clerk/backend";
import { env } from "../env.js";
import type { AppEnv } from "../app.js";

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    const clerkId = payload.sub;
    if (!clerkId) {
      throw new HTTPException(401, { message: "Invalid token: no subject" });
    }

    c.set("userId", clerkId);
    c.set("userRole", (payload as any).public_metadata?.role ?? "user");

    await next();
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error("[AUTH] Token verification failed:", err);
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
};
