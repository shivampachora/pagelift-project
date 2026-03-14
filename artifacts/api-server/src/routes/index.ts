import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import subscriptionRouter from "./subscription";
import onboardingRouter from "./onboarding";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/subscription", subscriptionRouter);
router.use("/onboarding", onboardingRouter);
router.use("/admin", adminRouter);

export default router;
