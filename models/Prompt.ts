import mongoose from "mongoose";

const promptSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 512,
        minLength: 1,
    },
    prompt: {
        type: String,
        required: true,
        maxLength: 5120,
        minLength: 1,
    },
    content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
    }
}, { timestamps: true });

export type IPrompt = {
    _id?: mongoose.Schema.Types.ObjectId;
    title: string;
    prompt: string;
    content?: mongoose.Schema.Types.ObjectId | null;
    createdAt?: Date;
    updatedAt?: Date;
};

export default mongoose.model("Prompt", promptSchema);
