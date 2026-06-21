import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { db, schema } from "../lib/db.js";

const portfolioRoute = new Hono<AppEnv>();

portfolioRoute.get("/portfolio/summary", async (c) => {
  const clerkId = c.get("userId");

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const holdings = await db.query.holdings.findMany({
    where: and(eq(schema.holdings.userId, user.id), eq(schema.holdings.status, "open")),
    with: { stock: true },
  });

  let totalInvested = 0;
  const holdingsSummary = holdings.map((h: any) => {
    const invested = parseFloat(h.investedAmount);
    totalInvested += invested;
    return {
      id: h.id,
      stockId: h.stockId,
      symbol: h.stock.symbol,
      name: h.stock.name,
      quantity: parseFloat(h.quantity),
      avgBuyPrice: parseFloat(h.avgBuyPrice),
      investedAmount: invested,
    };
  });

  return c.json({
    success: true,
    data: {
      totalInvested,
      holdingsCount: holdings.length,
      holdings: holdingsSummary,
    },
  });
});

portfolioRoute.get("/portfolio/holdings", async (c) => {
  const clerkId = c.get("userId");
  const status = c.req.query("status") ?? "open";

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const holdings = await db.query.holdings.findMany({
    where: and(eq(schema.holdings.userId, user.id), eq(schema.holdings.status, status)),
    with: { stock: true, recommendation: true },
  });

  return c.json({ success: true, data: holdings });
});

portfolioRoute.get("/portfolio/holdings/:stockId", async (c) => {
  const clerkId = c.get("userId");
  const stockId = c.req.param("stockId");

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const holding = await db.query.holdings.findFirst({
    where: and(
      eq(schema.holdings.userId, user.id),
      eq(schema.holdings.stockId, stockId),
      eq(schema.holdings.status, "open")
    ),
    with: { stock: true, recommendation: true, transactions: true },
  });

  if (!holding) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Holding not found" } }, 404);
  }

  return c.json({ success: true, data: holding });
});

export { portfolioRoute };
