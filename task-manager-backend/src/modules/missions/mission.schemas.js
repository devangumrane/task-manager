import { z } from "zod";

export const createMissionSchema = z.object({
    title: z.string().min(5),
    slug: z.string().min(3),
    skillId: z.number(),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
    xpReward: z.number().int().positive().default(100),
    description: z.string().min(10),
    objectives: z.array(z.string()).min(1),
    acceptanceCriteria: z.array(z.string()).min(1),
    starterCodeUrl: z.string().url().optional(),
    prerequisites: z.record(z.any()).optional(), // Flexible JSON
});

export const updateMissionSchema = z.object({
    title: z.string().min(5).optional(),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
    xpReward: z.number().int().positive().optional(),
    description: z.string().optional(),
    objectives: z.array(z.string()).optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
});
