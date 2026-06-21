import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { db, schema } from "../lib/db.js";

const watchlistRoute = new Hono<AppEnv>();

watchlistRoute.get("/watchlist", async (c) => {
  const clerkId = c.get("userId");

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const watchlist = await db.query.watchlists.findFirst({
    where: eq(schema.watchlists.userId, user.id),
    with: {
      items: {
        with: { stock: true },
      },
    },
  });

  if (!watchlist) {
    return c.json({ success: true, data: { id: null, items: [] } });
  }

  return c.json({ success: true, data: watchlist });
});

const addStockSchema = z.object({
  stockId: z.string().uuid(),
});

watchlistRoute.post("/watchlist", async (c) => {
  const clerkId = c.get("userId");
  const body = await c.req.json();
  const data = addStockSchema.parse(body);

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  let watchlist = await db.query.watchlists.findFirst({
    where: eq(schema.watchlists.userId, user.id),
  });

  if (!watchlist) {
    const [created] = await db
      .insert(schema.watchlists)
      .values({ userId: user.id, name: "Default" })
      .returning();
    watchlist = created;
  }

  const [item] = await db
    .insert(schema.watchlistItems)
    .values({ watchlistId: watchlist.id, stockId: data.stockId })
    .onConflictDoNothing()
    .returning();

  return c.json({ success: true, data: item ?? { stockId: data.stockId } }, 201);
});

watchlistRoute.delete("/watchlist/:stockId", async (c) => {
  const clerkId = c.get("userId");
  const stockId = c.req.param("stockId");

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const watchlist = await db.query.watchlists.findFirst({
    where: eq(schema.watchlists.userId, user.id),
  });

  if (!watchlist) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Watchlist not found" } }, 404);
  }

  await db
    .delete(schema.watchlistItems)
    .where(
      and(
        eq(schema.watchlistItems.watchlistId, watchlist.id),
        eq(schema.watchlistItems.stockId, stockId)
      )
    );

  return c.json({ success: true, data: { removed: stockId } });
});

export { watchlistRoute };
