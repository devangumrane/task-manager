// Load ENV first
import dotenv from "dotenv";
dotenv.config();

// Core imports
import http from "http";
import cookieParser from "cookie-parser";
import app from "./app.js";
import prisma from "./core/database/prisma.js";
import bree from "./core/jobs/bree.js";
import { initSocket } from "./core/realtime/socket.js";

// HTTP + SOCKET SERVER
const server = http.createServer(app);
const io = initSocket(server);

// BACKGROUND JOBS (Bree)
bree.start();

bree.on("worker created", (name) =>
  console.log("bree worker created:", name)
);
bree.on("start", () => console.log("bree started"));
bree.on("error", (jobName, err) =>
  console.error("bree job error", jobName, err)
);

// START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// GLOBAL ERROR HANDLERS (must be last)
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED_REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT_EXCEPTION:", err);
});

// GRACEFUL SHUTDOWN
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");

  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error("Error disconnecting Prisma:", e);
  }

  server.close(() => process.exit(0));
});
