import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SignupBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
  }
}

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const parsed = SignupBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const { name, businessName, phone, email, password } = parsed.data;

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db.insert(usersTable).values({
      name,
      businessName,
      phone,
      email,
      passwordHash,
    }).returning();

    req.session.userId = user.id;

    return res.json({
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        businessName: user.businessName,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const { email, password } = parsed.data;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    req.session.userId = user.id;

    return res.json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        businessName: user.businessName,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully" });
  });
});

router.get("/me", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Not authenticated" });
    }

    return res.json({
      id: user.id,
      name: user.name,
      businessName: user.businessName,
      phone: user.phone,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Get me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
