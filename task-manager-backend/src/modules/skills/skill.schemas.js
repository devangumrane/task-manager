import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  category: z.enum([
    "BACKEND",
    "DATABASE",
    "DEVOPS",
    "SYSTEM_DESIGN",
    "ALGORITHMS",
    "TESTING",
    "SECURITY",
    "FRONTEND",
  ]),
  description: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("BEGINNER"),
  parentId: z.number().optional(),
  icon: z.string().optional(),
});

export const updateSkillSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
  icon: z.string().optional(),
});
