// zod validation for user endpoints
import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  profileImage: z.string().url().optional(),
});

export const searchUsersSchema = z.object({
  q: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform((s) => Number(s)),
});
