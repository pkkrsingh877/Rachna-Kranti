import mongoose from "mongoose";

export interface IChapter {
  bookId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  content: Record<string, any>;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new mongoose.Schema<IChapter>(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ChapterSchema.pre("save", function (next) {
  if (this.isModified("content") && this.content) {
    const raw = JSON.stringify(this.content);
    this.wordCount = raw.split(/\s+/).filter(Boolean).length;
  }
  next();
});

ChapterSchema.index({ bookId: 1, order: 1 });

export default mongoose.models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);
