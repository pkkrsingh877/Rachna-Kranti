import mongoose from "mongoose";

export interface IUserPreferences {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'sm' | 'base' | 'lg';
  autoSave?: boolean;
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
    bio: { type: String, default: "" },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      fontSize: { type: String, enum: ['sm', 'base', 'lg'], default: 'base' },
      autoSave: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
