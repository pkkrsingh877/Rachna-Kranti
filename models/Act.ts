import mongoose from "mongoose";

export interface IAct {
  dramaId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ActSchema = new mongoose.Schema<IAct>(
  {
    dramaId: { type: mongoose.Schema.Types.ObjectId, ref: "Drama", required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

ActSchema.index({ dramaId: 1, order: 1 });

export default mongoose.models.Act || mongoose.model<IAct>("Act", ActSchema);
