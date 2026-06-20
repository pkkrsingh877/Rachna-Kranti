import mongoose from "mongoose";

export interface IDialogueLine {
  speaker: string;
  text: string;
}

export interface IScene {
  dramaId: mongoose.Types.ObjectId;
  actId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  content: IDialogueLine[];
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SceneSchema = new mongoose.Schema<IScene>(
  {
    dramaId: { type: mongoose.Schema.Types.ObjectId, ref: "Drama", required: true, index: true },
    actId: { type: mongoose.Schema.Types.ObjectId, ref: "Act", required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    content: [
      {
        speaker: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SceneSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const raw = this.content.map((l) => l.text).join(" ");
    this.wordCount = raw.split(/\s+/).filter(Boolean).length;
  }
  next();
});

SceneSchema.index({ actId: 1, order: 1 });
SceneSchema.index({ dramaId: 1 });

export default mongoose.models.Scene || mongoose.model<IScene>("Scene", SceneSchema);
