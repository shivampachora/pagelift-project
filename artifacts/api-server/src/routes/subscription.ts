import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/activate", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (user.subscriptionStatus !== "READY_FOR_PAYMENT") {
      return res.status(400).json({ error: "Subscription is not ready for payment" });
    }

    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
    const nextPaymentDateStr = nextPaymentDate.toISOString().split("T")[0];

    const [updated] = await db.update(usersTable)
      .set({
        subscriptionStatus: "ACTIVE",
        nextPaymentDate: nextPaymentDateStr,
      })
      .where(eq(usersTable.id, req.session.userId))
      .returning();

    return res.json({
      id: updated.id,
      name: updated.name,
      businessName: updated.businessName,
      email: updated.email,
      phone: updated.phone,
      websiteUrl: updated.websiteUrl ?? null,
      planPrice: updated.planPrice ?? null,
      subscriptionStatus: updated.subscriptionStatus ?? null,
      nextPaymentDate: updated.nextPaymentDate ?? null,
    });
  } catch (err) {
    console.error("Activate subscription error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
