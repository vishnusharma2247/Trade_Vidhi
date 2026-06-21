import { Hono } from "hono";
import { ilike, or, eq } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { db, schema } from "../lib/db.js";

const stocksRoute = new Hono<AppEnv>();

stocksRoute.get("/stocks/search", async (c) => {
  const q = c.req.query("q");

  if (!q || q.length < 1) {
    return c.json({ success: true, data: [] });
  }

  const results = await db.query.stocks.findMany({
    where: or(
      ilike(schema.stocks.symbol, `%${q}%`),
      ilike(schema.stocks.name, `%${q}%`)
    ),
    limit: 20,
  });

  return c.json({ success: true, data: results });
});

stocksRoute.get("/stocks/:id", async (c) => {
  const id = c.req.param("id");

  const stock = await db.query.stocks.findFirst({
    where: eq(schema.stocks.id, id),
  });

  if (!stock) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Stock not found" } }, 404);
  }

  return c.json({ success: true, data: stock });
});

export { stocksRoute };
