import express from "express";
import { userController } from "./user.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { avatarUpload } from "../../core/uploads/multer.js";

const router = express.Router();

router.get("/me", requireAuth, userController.getMe);
router.patch("/me", requireAuth, userController.updateMe);
router.get("/search", requireAuth, userController.search);
router.get("/:id", requireAuth, userController.getUser);

// avatar upload (multipart/form-data, form field: "avatar")
router.post("/me/avatar", requireAuth, avatarUpload.single("avatar"), userController.uploadAvatar);

export default router;
