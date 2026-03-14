import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminUpdateUserBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_EMAIL = "admin@localsite.com";
const ADMIN_PASSWORD = "admin123";

function requireAdmin(req: Request, res: Response, next: () => void) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ error: "Not authenticated as admin" });
  }
  return next();
}

router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ message: "Admin logged in successfully" });
  }

  return res.status(401).json({ error: "Invalid admin credentials" });
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.isAdmin = false;
  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    return res.json({ message: "Admin logged out successfully" });
  });
});

router.get("/users", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);

    return res.json(users.map((u) => ({
      id: u.id,
      name: u.name,
      businessName: u.businessName,
      email: u.email,
      phone: u.phone,
      websiteUrl: u.websiteUrl ?? null,
      planPrice: u.planPrice ?? null,
      subscriptionStatus: u.subscriptionStatus ?? null,
      nextPaymentDate: u.nextPaymentDate ?? null,
      requestType: u.requestType ?? null,
      createdAt: u.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error("Admin get users error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const parsed = AdminUpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData: Partial<typeof usersTable.$inferInsert> = {};
    if (parsed.data.websiteUrl !== undefined) updateData.websiteUrl = parsed.data.websiteUrl;
    if (parsed.data.planPrice !== undefined) updateData.planPrice = parsed.data.planPrice;
    if (parsed.data.subscriptionStatus !== undefined) updateData.subscriptionStatus = parsed.data.subscriptionStatus;
    if (parsed.data.nextPaymentDate !== undefined) updateData.nextPaymentDate = parsed.data.nextPaymentDate;

    const [updated] = await db.update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, id))
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
      requestType: updated.requestType ?? null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Admin update user error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
