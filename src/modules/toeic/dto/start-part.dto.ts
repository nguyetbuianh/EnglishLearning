import { z } from "zod";

export const startPartDto = z.object({
  testId: z.coerce.number().int().positive(),
  partId: z.coerce.number().int().min(1).max(7),
});

export type StartPartDto = z.infer<typeof startPartDto>;
