import { z } from 'zod';

export const createSettlementSchema = z.object({
  to: z.string().min(1, 'Recipient user ID is required'),
  amount: z.number().positive('Settlement amount must be positive'),
  currency: z.string().min(3).max(3).optional(),
  note: z.string().max(200).optional().default(''),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
