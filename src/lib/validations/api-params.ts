// ==============================================================
// DealFlow CRM — API Query Parameter Validations
// ==============================================================

import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortSchema = z.object({
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  assignedToId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const createActivitySchema = z.object({
  leadId: z.string().optional(),
  type: z.enum([
    'NOTE', 'CALL', 'EMAIL', 'MEETING',
    'SITE_VISIT', 'FOLLOW_UP', 'STATUS_CHANGE', 'DEAL_UPDATE',
  ]),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
export type CreateActivityFormData = z.infer<typeof createActivitySchema>;
