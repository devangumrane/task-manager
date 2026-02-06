import express from "express";
import { analyticsController } from "./analytics.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/my-skills", analyticsController.getMySkills);
router.get("/skills", analyticsController.listAllSkills);
router.post("/skills", analyticsController.createSkill); // Ideally protected for admin or open for now

export default router;
