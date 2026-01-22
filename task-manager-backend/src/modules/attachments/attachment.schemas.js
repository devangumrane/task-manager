import { z } from "zod";

export const uploadAttachmentSchema = z.object({
  taskId: z.number(),
});
