import express from "express";
import { taskController } from "./task.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/v1/tasks/me
router.get("/me", requireAuth, taskController.listMyTasks);

export default router;
