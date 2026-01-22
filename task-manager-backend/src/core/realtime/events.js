// src/core/realtime/events.js

export const EVENTS = {
  // -----------------------
  // Presence (no role required)
  // -----------------------
  "presence.online": {
    title: "User online",
    icon: "presence-online",
  },
  "presence.offline": {
    title: "User offline",
    icon: "presence-offline",
  },
  "presence.joined": {
    title: "User joined workspace",
    icon: "presence-joined",
  },
  "presence.left": {
    title: "User left workspace",
    icon: "presence-left",
  },

  // -----------------------
  // Workspace
  // -----------------------
  "workspace.created": {
    title: "Workspace created",
    icon: "workspace",
    requiredRole: "admin",
  },
  "workspace.member_added": {
    title: "Workspace member added",
    icon: "user-add",
    requiredRole: "admin",
  },

  // -----------------------
  // Project
  // -----------------------
  "project.created": {
    title: "Project created",
    icon: "project",
    requiredRole: "admin",
  },
  "project.updated": {
    title: "Project updated",
    icon: "project-update",
    requiredRole: "admin",
  },
  "project.deleted": {
    title: "Project deleted",
    icon: "project-delete",
    requiredRole: "admin",
  },

  // -----------------------
  // Task
  // -----------------------
  "task.created": {
    title: "Task created",
    icon: "task",
    requiredRole: "member", // any member can create tasks (common UX)
  },
  "task.updated": {
    title: "Task updated",
    icon: "task-update",
    requiredRole: "member",
    format: (meta) => meta.changes || meta,
  },
  "task.deleted": {
    title: "Task deleted",
    icon: "task-delete",
    requiredRole: "admin", // deleting tasks is destructive → admin only
  },

  // -----------------------
  // Attachments
  // -----------------------
  "attachment.uploaded": {
    title: "Attachment uploaded",
    icon: "attachment",
    requiredRole: "member",
  },
  "attachment.deleted": {
    title: "Attachment deleted",
    icon: "attachment-delete",
    requiredRole: "member",
  },

  // -----------------------
  // Reminders
  // -----------------------
  "reminder.created": {
    title: "Reminder created",
    icon: "reminder",
    requiredRole: "member",
  },
  "reminder.deleted": {
    title: "Reminder deleted",
    icon: "reminder-delete",
    requiredRole: "member",
  },
  "reminder.triggered": {
    title: "Reminder triggered",
    icon: "alarm",
    requiredRole: "member", // system event for Bree worker
  },

  // -----------------------
  // User events
  // -----------------------
  "user.updated": {
    title: "Profile updated",
    icon: "user",
  },
  "user.avatar_uploaded": {
    title: "Avatar updated",
    icon: "avatar",
  },
};
