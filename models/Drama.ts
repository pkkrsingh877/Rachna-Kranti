import mongoose from "mongoose";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "untitled";
}

export interface IDrama {
  title: string;
  slug?: string;
  authorId: mongoose.Types.ObjectId;
  type: "Drama" | "Play" | "Screenplay" | "Stage Script" | "TV Script";
  description?: string;
  coverImage?: string;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  actsCount: number;
  scenesCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DramaSchema = new mongoose.Schema<IDrama>(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["Drama", "Play", "Screenplay", "Stage Script", "TV Script"],
      default: "Drama",
    },
    description: { type: String },
    coverImage: { type: String },
    status: {
      type: String,
      enum: ["draft", "review", "scheduled", "published", "archived"],
      default: "draft",
      index: true,
    },
    actsCount: { type: Number, default: 0 },
    scenesCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

DramaSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = generateSlug(this.title);
  }
  next();
});

export default mongoose.models.Drama || mongoose.model<IDrama>("Drama", DramaSchema);
