import { Router } from "express";
import { skillController } from "./skill.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";

const router = Router();

// Public routes (or authenticated but generic)
router.get("/", requireAuth, skillController.list);
router.get("/:skillId", requireAuth, skillController.get);

// Admin routes
router.post("/", requireAuth, requireRole("admin"), skillController.create);
router.patch("/:skillId", requireAuth, requireRole("admin"), skillController.update);

export default router;
