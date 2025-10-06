import { z } from 'zod';

export const GetNextQuestionSchema = z.object({
  partId: z
    .string()
    .transform(Number)
    .refine((val) => val > 0, { message: 'partId must be a positive integer' }),
  last: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || val > 0, { message: 'last must be a positive integer' }),
});

export type GetNextQuestionDto = z.infer<typeof GetNextQuestionSchema>;
