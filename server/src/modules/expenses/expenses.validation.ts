import { z } from 'zod';

export const participantInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amount: z.number().min(0).optional(),
  share: z.number().min(0.1).optional(),
  percentage: z.number().min(0).max(100).optional(),
});

export const createExpenseSchema = z
  .object({
    description: z.string().min(1, 'Description is required').max(200).trim(),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().min(3).max(3).optional(),
    paidBy: z.string().min(1, 'Paid by user is required'),
    splitType: z.enum(['equal', 'exact', 'percentage', 'shares']).default('equal'),
    category: z.string().max(50).optional().default('General'),
    notes: z.string().max(500).optional().default(''),
    participants: z.array(participantInputSchema).min(1, 'At least one participant is required'),
  })
  .refine(
    (data) => {
      if (data.splitType === 'exact') {
        const sum = data.participants.reduce((acc, p) => acc + (p.amount || 0), 0);
        return Math.abs(sum - data.amount) <= 0.05;
      }
      if (data.splitType === 'percentage') {
        const sum = data.participants.reduce((acc, p) => acc + (p.percentage || 0), 0);
        return Math.abs(sum - 100) <= 0.5;
      }
      return true;
    },
    {
      message: 'Participant amounts or percentages do not match the total expense amount',
      path: ['participants'],
    }
  );

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
