import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../../lib/db.js";

const clerkWebhook = new Hono();

clerkWebhook.post("/clerk", async (c) => {
  const body = await c.req.json();
  const { type, data } = body;

  if (type === "user.created" || type === "user.updated") {
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address ?? null;
    const phone = data.phone_numbers?.[0]?.phone_number ?? null;
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
    const avatarUrl = data.image_url ?? null;

    const existing = await db.query.users.findFirst({
      where: eq(schema.users.clerkId, clerkId),
    });

    if (existing) {
      await db
        .update(schema.users)
        .set({ email, phone, fullName, avatarUrl, updatedAt: new Date() })
        .where(eq(schema.users.clerkId, clerkId));
    } else {
      const [newUser] = await db
        .insert(schema.users)
        .values({ clerkId, email, phone, fullName, avatarUrl })
        .returning();

      // Create default portfolio
      await db.insert(schema.portfolios).values({
        userId: newUser.id,
        name: "My Portfolio",
        isDefault: true,
      });

      // Create default watchlist
      await db.insert(schema.watchlists).values({
        userId: newUser.id,
        name: "Default",
      });
    }
  }

  if (type === "user.deleted") {
    const clerkId = data.id;
    await db
      .update(schema.users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.users.clerkId, clerkId));
  }

  return c.json({ received: true });
});

export { clerkWebhook };
