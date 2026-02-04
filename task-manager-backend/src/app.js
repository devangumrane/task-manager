// src/app.js
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import sequelize from "./config/database.js";
import "./models/index.js"; // Init associations
import errorMiddleware from "./core/middlewares/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import workspaceRoutes from "./modules/workspaces/workspace.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import { requireAuth } from "./core/middlewares/auth.middleware.js";

const app = express();
app.get('/debug-health', (req, res) => res.send('ok'));
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
        "http://localhost:5174",
        "http://127.0.0.1:5174",
      ];

      if (allowed.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
// }));

// Rate limiting: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// app.use(limiter);

// Data Sanitization against XSS
// app.use(xss());

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------
// PUBLIC ROUTES
// ---------------------------------------------
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(API_PREFIX, requireAuth);
app.use(`${API_PREFIX}/workspaces`, workspaceRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

// ---------------------------------------------
// GLOBAL ERROR HANDLER
// ---------------------------------------------
app.use(errorMiddleware);

export default app;
