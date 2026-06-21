import { Hono } from "hono";
import { eq, desc, and } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { db, schema } from "../lib/db.js";

const notificationsRoute = new Hono<AppEnv>();

notificationsRoute.get("/notifications", async (c) => {
  const clerkId = c.get("userId");
  const page = parseInt(c.req.query("page") ?? "1");
  const limit = parseInt(c.req.query("limit") ?? "30");
  const offset = (page - 1) * limit;

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const notifications = await db.query.notifications.findMany({
    where: eq(schema.notifications.userId, user.id),
    orderBy: desc(schema.notifications.createdAt),
    limit,
    offset,
  });

  return c.json({ success: true, data: notifications, meta: { page, limit } });
});

notificationsRoute.patch("/notifications/read-all", async (c) => {
  const clerkId = c.get("userId");

  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  await db
    .update(schema.notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(eq(schema.notifications.userId, user.id), eq(schema.notifications.isRead, false))
    );

  return c.json({ success: true, data: { markedAll: true } });
});

notificationsRoute.patch("/notifications/:id/read", async (c) => {
  const id = c.req.param("id");

  const [updated] = await db
    .update(schema.notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(schema.notifications.id, id))
    .returning();

  if (!updated) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Notification not found" } }, 404);
  }

  return c.json({ success: true, data: updated });
});

export { notificationsRoute };
