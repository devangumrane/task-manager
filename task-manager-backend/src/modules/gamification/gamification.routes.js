import { Router } from "express";
import { gamificationController } from "./gamification.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.get("/stats", requireAuth, gamificationController.getStats);

export default router;
