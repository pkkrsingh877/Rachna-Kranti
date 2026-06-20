import mongoose from "mongoose";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "untitled";
}

export interface IBook {
  title: string;
  slug?: string;
  authorId: mongoose.Types.ObjectId;
  type: "Novel" | "Novella" | "Biography" | "Autobiography" | "Memoir" | "Anthology" | "Research" | "General";
  subtitle?: string;
  description?: string;
  coverImage?: string;
  tags?: string[];
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  chapterCount: number;
  subjectPerson?: string;
  birthDate?: Date;
  deathDate?: Date;
  timelineEnabled?: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new mongoose.Schema<IBook>(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["Novel", "Novella", "Biography", "Autobiography", "Memoir", "Anthology", "Research", "General"],
      default: "General",
    },
    subtitle: { type: String },
    description: { type: String },
    coverImage: { type: String },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "review", "scheduled", "published", "archived"],
      default: "draft",
      index: true,
    },
    chapterCount: { type: Number, default: 0 },
    subjectPerson: { type: String },
    birthDate: { type: Date },
    deathDate: { type: Date },
    timelineEnabled: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BookSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = generateSlug(this.title);
  }
  next();
});

export default mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);
