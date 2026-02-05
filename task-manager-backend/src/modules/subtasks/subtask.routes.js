import express from "express";
import { subtaskController } from "./subtask.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = express.Router({ mergeParams: true });

// Mounted at /tasks/:taskId/subtasks

router.use(requireAuth);

router.get("/", subtaskController.list);
router.post("/", subtaskController.create);
router.patch("/:subtaskId", subtaskController.update);
router.delete("/:subtaskId", subtaskController.delete);

export default router;
