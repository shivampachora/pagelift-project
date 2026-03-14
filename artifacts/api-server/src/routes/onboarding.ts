import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/request-website", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { businessName } = req.body;
  if (!businessName || typeof businessName !== "string" || businessName.trim().length < 1) {
    return res.status(400).json({ error: "Business name is required" });
  }

  try {
    await db.update(usersTable)
      .set({
        businessName: businessName.trim(),
        requestType: "new_website_request",
      })
      .where(eq(usersTable.id, req.session.userId));

    return res.json({ message: "Website request submitted successfully" });
  } catch (err) {
    console.error("Request website error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/connect-website", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { businessName, websiteUrl } = req.body;
  if (!businessName || typeof businessName !== "string" || businessName.trim().length < 1) {
    return res.status(400).json({ error: "Business name is required" });
  }
  if (!websiteUrl || typeof websiteUrl !== "string" || websiteUrl.trim().length < 1) {
    return res.status(400).json({ error: "Website URL is required" });
  }

  try {
    await db.update(usersTable)
      .set({
        businessName: businessName.trim(),
        websiteUrl: websiteUrl.trim(),
        requestType: "existing_website_link",
      })
      .where(eq(usersTable.id, req.session.userId));

    return res.json({ message: "Website connection request submitted successfully" });
  } catch (err) {
    console.error("Connect website error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
