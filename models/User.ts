import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
    bio: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
