import express from "express";
import { commentController } from "./comment.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = express.Router({ mergeParams: true });

// Routes are mounted at /tasks/:taskId/comments

router.use(requireAuth);

router.get("/", commentController.list);
router.post("/", commentController.create);
router.delete("/:commentId", commentController.delete);

export default router;
