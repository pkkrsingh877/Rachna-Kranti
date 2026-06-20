import { z } from 'zod';

export const stanzaSchema = z.object({
  type: z.literal('stanza'),
  lines: z.array(z.string()),
});

export const paragraphSchema = z.object({
  type: z.literal('paragraph'),
  text: z.string(),
});

export const characterDialogueSchema = z.object({
  type: z.literal('line'),
  text: z.string(),
});

export const characterSchema = z.object({
  type: z.literal('character'),
  name: z.string(),
  dialogue: z.array(characterDialogueSchema),
});

export const sceneSchema = z.object({
  type: z.literal('scene'),
  title: z.string(),
  content: z.array(z.union([paragraphSchema, characterSchema])),
});

export const actSchema = z.object({
  type: z.literal('act'),
  title: z.string(),
  scenes: z.array(sceneSchema),
});

export const poemContentSchema = z.array(stanzaSchema);
export const storyContentSchema = z.array(paragraphSchema);
export const proseContentSchema = z.array(paragraphSchema);
export const dramaContentSchema = z.array(actSchema);

export const contentTypeEnum = z.enum(['poem', 'story', 'prose', 'drama']);

export const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  contentType: contentTypeEnum,
  content: z.any(),
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

export type ContentInput = z.infer<typeof contentSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
