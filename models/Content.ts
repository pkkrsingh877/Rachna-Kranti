import mongoose, { Schema, Document } from 'mongoose';

// 1. Base Interface
export interface IBaseWork extends Document {
  title: string;
  slug: string;
  authorId: mongoose.Schema.Types.ObjectId;
  contentType: 'Poem' | 'Prose' | 'Story';
  content: Record<string, any>;
  tags?: string[];
  description?: string;
  excerpt?: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  aiGenerated: boolean;
  aiModel?: string;
  likesCount: number;
  wordCount?: number;
  readingTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'untitled';
}

// 2. Base Schema (with discriminator config)
const baseOptions = {
  discriminatorKey: 'contentType',
  collection: 'literaryWorks',
  timestamps: true,
};

const contentSchema = new Schema<IBaseWork>({
  title: { type: String, required: true, index: true },
  slug: { type: String, index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true, index: true },
  content: { type: Schema.Types.Mixed, required: true },
  tags: [{ type: String }],
  description: { type: String },
  excerpt: { type: String, maxlength: 280 },
  coverImage: { type: String },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  publishedAt: { type: Date },
  aiGenerated: { type: Boolean, default: false },
  aiModel: { type: String },
  likesCount: { type: Number, default: 0 },
  wordCount: { type: Number },
  readingTime: { type: Number },
}, baseOptions);

contentSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = generateSlug(this.title);
  }
  if (this.isModified('content') && this.content) {
    const raw = JSON.stringify(this.content);
    this.wordCount = raw.split(/\s+/).filter(Boolean).length;
    this.readingTime = Math.max(1, Math.ceil(this.wordCount / 200));
  }
  next();
});

// 3. Base Model (🛡️ Check before defining)
export const Content = mongoose.models.Content || mongoose.model<IBaseWork>('Content', contentSchema);

// 4. Discriminated Models (🛡️ Check before defining)
export const Poem = mongoose.models.Poem || Content.discriminator(
  'Poem',
  new Schema({}, baseOptions)
);

export const Prose = mongoose.models.Prose || Content.discriminator(
  'Prose',
  new Schema({}, baseOptions)
);

export const Story = mongoose.models.Story || Content.discriminator(
  'Story',
  new Schema({}, baseOptions)
);