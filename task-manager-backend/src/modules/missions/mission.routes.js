import { Router } from "express";
import { missionController } from "./mission.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";

const router = Router();

router.get("/", requireAuth, missionController.list);
router.get("/:missionId", requireAuth, missionController.get);

// Admin Routes
router.post("/", requireAuth, requireRole("admin"), missionController.create);
router.patch("/:missionId", requireAuth, requireRole("admin"), missionController.update);

export default router;
