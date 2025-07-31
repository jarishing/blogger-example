import {
  pgTable, text, timestamp, varchar, integer, json
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const tasks = pgTable('task', {
  // Note: Missing primary key in the reference migration, but we'll add one for data integrity
  taskId: varchar('task_id', { length: 64 }).primaryKey(),
  agentId: varchar('agent_id', { length: 64 }),
  progress: integer('progress'),
  message: varchar('message'),
  failedReason: varchar('failed_reason'),
  returnData: text('return_data'),
  processedAt: timestamp('processed_at'),
  finishedAt: timestamp('finished_at'),
  type: varchar('type').notNull(),
  payload: json('payload'),
  processStatus: varchar('process_status').notNull().default('pending'),
  recordStatus: varchar('record_status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Zod schemas for validation
export const insertTaskSchema = createInsertSchema(tasks, {
  type: z.string().min(1),
  processStatus: z.string().min(1),
  recordStatus: z.string().min(1)
});

export const selectTaskSchema = createSelectSchema(tasks);

// Types
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
