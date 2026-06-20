import mongoose from 'mongoose';

export interface ILike {
  contentId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new mongoose.Schema<ILike>(
  {
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

LikeSchema.index({ contentId: 1, userId: 1 }, { unique: true });
LikeSchema.index({ userId: 1 });

export default mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);
