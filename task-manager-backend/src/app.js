// src/app.js
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import errorMiddleware from "./core/middlewares/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import workspaceRoutes from "./modules/workspaces/workspace.routes.js";
import skillRoutes from "./modules/skills/skill.routes.js";
import missionRoutes from "./modules/missions/mission.routes.js";
import gamificationRoutes from "./modules/gamification/gamification.routes.js";
import { requireAuth } from "./core/middlewares/auth.middleware.js";

const app = express();
const API_PREFIX = "/api/v1";

// ---------------------------------------------
// GLOBAL MIDDLEWARES (CORS MUST BE FIRST)
// ---------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser tools like Postman
      if (!origin) return callback(null, true);

      const allowed = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ];

      if (allowed.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------
// PUBLIC ROUTES
// ---------------------------------------------
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

// ---------------------------------------------
// PROTECTED ROUTES
// ---------------------------------------------
app.use(API_PREFIX, requireAuth);
app.use(`${API_PREFIX}/workspaces`, workspaceRoutes);
app.use(`${API_PREFIX}/skills`, skillRoutes);
app.use(`${API_PREFIX}/missions`, missionRoutes);
app.use(`${API_PREFIX}/gamification`, gamificationRoutes);

// ---------------------------------------------
// GLOBAL ERROR HANDLER
// ---------------------------------------------
app.use(errorMiddleware);

export default app;
