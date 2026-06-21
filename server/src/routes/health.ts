import { Hono } from "hono";
import { db } from "../lib/db.js";
import { sql } from "drizzle-orm";

const health = new Hono();

health.get("/health", async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch {
    return c.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      503
    );
  }
});

export { health };
