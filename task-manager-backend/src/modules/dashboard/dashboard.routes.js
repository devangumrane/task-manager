import express from "express";
import { dashboardController } from "./dashboard.controller.js";

const router = express.Router();

router.get("/stats", dashboardController.getStats);

export default router;
