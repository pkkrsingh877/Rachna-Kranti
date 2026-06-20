import { z } from 'zod';

const tiptapBlockSchema = z.object({
  type: z.string(),
  content: z.any().optional(),
  text: z.string().optional(),
  attrs: z.record(z.unknown()).optional(),
  marks: z.array(z.any()).optional(),
});

const tiptapDocSchema = z.object({
  type: z.literal('doc'),
  content: z.array(tiptapBlockSchema),
});

export const contentTypeEnum = z.enum(['poem', 'story', 'prose', 'drama']);

export const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  contentType: contentTypeEnum,
  content: tiptapDocSchema,
  tags: z.array(z.string().max(50)).max(10).optional(),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  status: z.enum(['draft', 'published']).default('published'),
});

export const generateContentSchema = z.object({
  title: z.string().min(1).max(200),
  prompt: z.string().min(1).max(5000),
  type: contentTypeEnum,
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(2000),
  parentId: z.string().optional(),
});

export type ContentInput = z.infer<typeof contentSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
