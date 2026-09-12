import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      // Check if either OAuth ID is present on the instance
      return !this.googleId && !this.githubId;
    },
  },
  bio: { type: String, default: "" },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  
  // --- New Profile Fields ---
  location: { type: String, default: "" },
  university: { type: String, default: "" },
  jobProfile: { 
    type: String, 
    enum: ["Student", "Working Professional", "Freelancer", "Other", ""], 
    default: "" 
  },
  branch: { type: String, default: "" },

  isEmailVerified: { type: Boolean, default: false },
  emailVerificationTokenHash: { type: String, default: null },
  emailVerificationTokenExpiry: { type: Date, default: null },
  resetPasswordTokenHash: { type: String, default: null },
  resetPasswordTokenExpiry: { type: Date, default: null },

  githubId: { type: String, default: null, unique: true, sparse: true },
  githubAccessToken: { type: String, default: null, select: false },
  githubUsername: { type: String, default: null },
  
  // 👈 FIX: Added unique: true alongside sparse: true
  googleId: { type: String, default: null, unique: true, sparse: true },
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    delete ret.emailVerificationTokenHash;
    delete ret.emailVerificationTokenExpiry;
    delete ret.resetPasswordTokenHash;
    delete ret.resetPasswordTokenExpiry;
    delete ret.githubAccessToken;
  },
});

export default mongoose.model("User", userSchema);