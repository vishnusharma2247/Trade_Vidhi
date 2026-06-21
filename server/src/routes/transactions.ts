import { Hono } from "hono";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { db, schema } from "../lib/db.js";

const transactionsRoute = new Hono<AppEnv>();

transactionsRoute.get("/transactions", async (c) => {
  const clerkId = c.get("userId");
  const type = c.req.query("type");
  const page = parseInt(c.req.query("page") ?? "1");
  const limit = parseInt(c.req.query("limit") ?? "20");
  const offset = (page - 1) * limit;

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const conditions = [eq(schema.transactions.userId, user.id)];
  if (type === "BUY" || type === "SELL") {
    conditions.push(eq(schema.transactions.type, type));
  }

  const results = await db.query.transactions.findMany({
    where: and(...conditions),
    with: { stock: true },
    orderBy: desc(schema.transactions.executedAt),
    limit,
    offset,
  });

  return c.json({ success: true, data: results, meta: { page, limit } });
});

const recordTradeSchema = z.object({
  stockId: z.string().uuid(),
  recommendationId: z.string().uuid().optional(),
  type: z.enum(["BUY", "SELL"]),
  quantity: z.number().positive(),
  price: z.number().positive(),
  fees: z.number().min(0).default(0),
  executionType: z.enum(["manual", "market", "limit"]).default("manual"),
  notes: z.string().optional(),
  executedAt: z.string().datetime().optional(),
});

transactionsRoute.post("/transactions", async (c) => {
  const clerkId = c.get("userId");
  const body = await c.req.json();
  const data = recordTradeSchema.parse(body);

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const userPortfolios = await db.query.portfolios.findMany({
    where: eq(schema.portfolios.userId, user.id),
  });

  const portfolio = userPortfolios.find((p) => p.isDefault) ?? userPortfolios[0];
  if (!portfolio) {
    return c.json({ success: false, error: { code: "NO_PORTFOLIO", message: "No portfolio found" } }, 400);
  }

  const totalAmount = data.quantity * data.price;
  const netAmount = data.type === "BUY" ? totalAmount + data.fees : totalAmount - data.fees;

  const [transaction] = await db
    .insert(schema.transactions)
    .values({
      userId: user.id,
      portfolioId: portfolio.id,
      stockId: data.stockId,
      recommendationId: data.recommendationId ?? null,
      type: data.type,
      quantity: data.quantity.toString(),
      price: data.price.toString(),
      totalAmount: totalAmount.toString(),
      fees: data.fees.toString(),
      netAmount: netAmount.toString(),
      executionType: data.executionType,
      notes: data.notes ?? null,
      executedAt: data.executedAt ? new Date(data.executedAt) : new Date(),
    })
    .returning();

  // Update or create holding
  if (data.type === "BUY") {
    const existingHolding = await db.query.holdings.findFirst({
      where: and(
        eq(schema.holdings.userId, user.id),
        eq(schema.holdings.stockId, data.stockId),
        eq(schema.holdings.status, "open")
      ),
    });

    if (existingHolding) {
      const existingQty = parseFloat(existingHolding.quantity);
      const existingAvg = parseFloat(existingHolding.avgBuyPrice);
      const newQty = existingQty + data.quantity;
      const newAvg = (existingQty * existingAvg + data.quantity * data.price) / newQty;
      const newInvested = newQty * newAvg;

      await db
        .update(schema.holdings)
        .set({
          quantity: newQty.toString(),
          avgBuyPrice: newAvg.toFixed(2),
          investedAmount: newInvested.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(schema.holdings.id, existingHolding.id));
    } else {
      await db.insert(schema.holdings).values({
        portfolioId: portfolio.id,
        userId: user.id,
        stockId: data.stockId,
        recommendationId: data.recommendationId ?? null,
        quantity: data.quantity.toString(),
        avgBuyPrice: data.price.toString(),
        investedAmount: totalAmount.toString(),
      });
    }
  }

  if (data.type === "SELL") {
    const holding = await db.query.holdings.findFirst({
      where: and(
        eq(schema.holdings.userId, user.id),
        eq(schema.holdings.stockId, data.stockId),
        eq(schema.holdings.status, "open")
      ),
    });

    if (holding) {
      const remainingQty = parseFloat(holding.quantity) - data.quantity;

      if (remainingQty <= 0) {
        await db
          .update(schema.holdings)
          .set({ status: "closed", quantity: "0", closedAt: new Date(), updatedAt: new Date() })
          .where(eq(schema.holdings.id, holding.id));
      } else {
        const avgPrice = parseFloat(holding.avgBuyPrice);
        await db
          .update(schema.holdings)
          .set({
            quantity: remainingQty.toString(),
            investedAmount: (remainingQty * avgPrice).toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(schema.holdings.id, holding.id));
      }
    }
  }

  return c.json({ success: true, data: transaction }, 201);
});

export { transactionsRoute };
