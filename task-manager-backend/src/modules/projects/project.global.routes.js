import express from "express";
import { projectController } from "./project.controller.js";

const router = express.Router();

// List all projects for the authenticated user (across all workspaces)
router.get("/", projectController.listAll);

export default router;
