import express from "express";
import { searchController } from "./search.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", searchController.globalSearch);

export default router;
