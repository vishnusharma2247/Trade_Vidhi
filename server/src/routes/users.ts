import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { db, schema } from "../lib/db.js";

const usersRoute = new Hono<AppEnv>();

usersRoute.get("/me", async (c) => {
  const clerkId = c.get("userId");

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  return c.json({ success: true, data: user });
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  riskProfile: z.enum(["conservative", "moderate", "aggressive"]).optional(),
  onboardingCompleted: z.boolean().optional(),
});

usersRoute.patch("/me", async (c) => {
  const clerkId = c.get("userId");
  const body = await c.req.json();
  const data = updateProfileSchema.parse(body);

  const [updated] = await db
    .update(schema.users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.users.clerkId, clerkId))
    .returning();

  if (!updated) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  return c.json({ success: true, data: updated });
});

export { usersRoute };
