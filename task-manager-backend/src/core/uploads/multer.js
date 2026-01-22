// src/core/uploads/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Base uploads directory
const uploadsRoot = path.join(process.cwd(), "uploads");

// Ensure root directory exists
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

/* ============================================================
    AVATAR UPLOADS
   ============================================================ */

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsRoot, "avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `user-${req.user.id}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

export const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  },
});

/* ============================================================
    TASK ATTACHMENTS UPLOADS
   ============================================================ */

const taskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // directory structure: /uploads/tasks/<workspaceId>/<projectId>/<taskId>/
    const dir = path.join(
      uploadsRoot,
      "tasks",
      req.params.id,          // workspace ID
      req.params.projectId,   // project ID
      req.params.taskId       // task ID
    );

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `attachment-${Date.now()}${ext}`;
    cb(null, name);
  },
});

export const taskUpload = multer({
  storage: taskStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/zip",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }

    cb(null, true);
  },
});
