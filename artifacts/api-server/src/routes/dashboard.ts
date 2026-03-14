import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    return res.json({
      id: user.id,
      name: user.name,
      businessName: user.businessName,
      email: user.email,
      phone: user.phone,
      websiteUrl: user.websiteUrl ?? null,
      planPrice: user.planPrice ?? null,
      subscriptionStatus: user.subscriptionStatus ?? null,
      nextPaymentDate: user.nextPaymentDate ?? null,
      requestType: user.requestType ?? null,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
