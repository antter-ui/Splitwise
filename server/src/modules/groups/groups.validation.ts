import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  description: z.string().max(300).optional().default(''),
  currency: z.string().min(3).max(3).optional().default('INR'),
  memberEmails: z.array(z.string().email()).optional().default([]),
});

export const addMemberSchema = z.object({
  email: z.string().email('Please provide a valid member email').toLowerCase().trim(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(300).optional(),
  currency: z.string().min(3).max(3).optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
