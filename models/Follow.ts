import mongoose from 'mongoose';

export interface IFollow {
  followerId: mongoose.Schema.Types.ObjectId;
  followingId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new mongoose.Schema<IFollow>(
  {
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1, createdAt: -1 });

export default mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);
