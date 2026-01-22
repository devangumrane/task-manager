// src/modules/notifications/notification.service.js
import nodemailer from "nodemailer";
import prisma from "../../core/database/prisma.js";
import { getEmitters } from "../../core/realtime/socket.js";

// Mail transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const notificationService = {
  async sendEmail({ to, subject, text, html }) {
    if (!to) return;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@task.app",
      to,
      subject,
      text,
      html,
    });

    console.log("[NOTIFY] email sent:", info.messageId);
    return info;
  },

  async createNotificationRecord({ userId, type, title, body, data = null }) {
    const n = await prisma.notification.create({
      data: { userId, type, title, body, data },
    });

    // ---- RUNTIME EMITTER RESOLUTION ----
    const emitters = getEmitters();
    if (emitters) {
      const { emitToUser } = emitters;
      emitToUser(userId, "notification.created", {
        notification: {
          id: n.id,
          type,
          title,
          body,
          data,
          createdAt: n.createdAt,
        },
        meta: {},
      });
    }

    return n;
  },

  async sendPush({ userId, title, body }) {
    await this.createNotificationRecord({
      userId,
      type: "push",
      title,
      body,
      data: null,
    });

    console.log("[NOTIFY] push (stub) ->", userId, title);
  },

  async sendTaskReminder({ reminder, task, user }) {
    const title = `Reminder: ${task.title}`;
    const message =
      reminder.note ||
      task.description ||
      "You have a task reminder.";

    // notif + realtime emit
    await this.createNotificationRecord({
      userId: user.id,
      type: "reminder",
      title,
      body: message,
      data: { taskId: task.id, reminderId: reminder.id },
    });

    // email fallback
    if (user.email) {
      await this.sendEmail({
        to: user.email,
        subject: title,
        text: message,
      });
    }

    // push stub
    await this.sendPush({
      userId: user.id,
      title,
      body: message,
    });
  },
};
