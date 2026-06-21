import { Hono } from "hono";
import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { db, schema } from "../lib/db.js";
import { adminMiddleware } from "../middleware/admin.js";

const recommendationsRoute = new Hono<AppEnv>();

recommendationsRoute.get("/recommendations", async (c) => {
  const status = c.req.query("status") ?? "active";
  const action = c.req.query("action");
  const page = parseInt(c.req.query("page") ?? "1");
  const limit = parseInt(c.req.query("limit") ?? "20");
  const offset = (page - 1) * limit;

  const conditions = [eq(schema.recommendations.status, status)];
  if (action) {
    conditions.push(eq(schema.recommendations.action, action));
  }

  const results = await db.query.recommendations.findMany({
    where: and(...conditions),
    with: { stock: true },
    orderBy: desc(schema.recommendations.publishedAt),
    limit,
    offset,
  });

  return c.json({ success: true, data: results, meta: { page, limit } });
});

recommendationsRoute.get("/recommendations/:id", async (c) => {
  const id = c.req.param("id");

  const recommendation = await db.query.recommendations.findFirst({
    where: eq(schema.recommendations.id, id),
    with: { stock: true, creator: true },
  });

  if (!recommendation) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Recommendation not found" } }, 404);
  }

  return c.json({ success: true, data: recommendation });
});

const createRecommendationSchema = z.object({
  stockId: z.string().uuid(),
  action: z.enum(["BUY", "SELL"]),
  entryPrice: z.number().positive(),
  targetPrice: z.number().positive(),
  stopLoss: z.number().positive(),
  riskLevel: z.enum(["low", "medium", "high"]),
  rationale: z.string().min(10),
  horizon: z.enum(["intraday", "short", "medium", "long"]).optional(),
  expiresAt: z.string().datetime().optional(),
});

recommendationsRoute.post("/recommendations", adminMiddleware, async (c) => {
  const clerkId = c.get("userId");
  const body = await c.req.json();
  const data = createRecommendationSchema.parse(body);

  const admin = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!admin) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Admin user not found" } }, 404);
  }

  const [recommendation] = await db
    .insert(schema.recommendations)
    .values({
      ...data,
      entryPrice: data.entryPrice.toString(),
      targetPrice: data.targetPrice.toString(),
      stopLoss: data.stopLoss.toString(),
      createdBy: admin.id,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    })
    .returning();

  return c.json({ success: true, data: recommendation }, 201);
});

const closeRecommendationSchema = z.object({
  status: z.enum(["target_hit", "sl_hit", "closed", "expired"]),
  exitPrice: z.number().positive(),
  exitReason: z.string().min(1).optional(),
});

recommendationsRoute.patch("/recommendations/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const data = closeRecommendationSchema.parse(body);

  const existing = await db.query.recommendations.findFirst({
    where: eq(schema.recommendations.id, id),
  });

  if (!existing) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Recommendation not found" } }, 404);
  }

  const entryPrice = parseFloat(existing.entryPrice);
  const pnlPercentage = ((data.exitPrice - entryPrice) / entryPrice) * 100;

  const [updated] = await db
    .update(schema.recommendations)
    .set({
      status: data.status,
      exitPrice: data.exitPrice.toString(),
      exitReason: data.exitReason ?? null,
      pnlPercentage: pnlPercentage.toFixed(2),
      closedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.recommendations.id, id))
    .returning();

  return c.json({ success: true, data: updated });
});

const actionSchema = z.object({
  action: z.enum(["followed", "ignored", "bookmarked"]),
});

recommendationsRoute.post("/recommendations/:id/action", async (c) => {
  const clerkId = c.get("userId");
  const recommendationId = c.req.param("id");
  const body = await c.req.json();
  const data = actionSchema.parse(body);

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const [result] = await db
    .insert(schema.recommendationActions)
    .values({
      userId: user.id,
      recommendationId,
      action: data.action,
    })
    .onConflictDoNothing()
    .returning();

  return c.json({ success: true, data: result ?? { action: data.action } });
});

export { recommendationsRoute };
