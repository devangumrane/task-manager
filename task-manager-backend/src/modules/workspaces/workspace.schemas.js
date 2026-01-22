import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
});

export const addMemberSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["admin", "member"]).default("member"),
});
