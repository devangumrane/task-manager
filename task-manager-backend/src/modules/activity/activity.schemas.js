// validation for API inputs (listing/filtering)
import { z } from "zod";

export const listActivitySchema = z.object({
  workspaceId: z.string().regex(/^\d+$/).transform(Number),
  page: z.string().optional().transform(v => v ? Number(v) : 1),
  perPage: z.string().optional().transform(v => v ? Number(v) : 25),
});
