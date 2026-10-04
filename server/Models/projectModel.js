import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    membersRequired: { type: Number, default: 1, min: 1 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Phase 1 Fields
    status: {
      type: String,
      enum: ["recruitment", "active", "completed"],
      default: "recruitment",
      index: true,
    },
    scope: {
      type: String,
      enum: ["campus", "global"],
      default: "campus",
      index: true,
    },
    universityName: { type: String, required: true, trim: true, index: true },

    // Phase 2 Draft Schema
    aiAnalysis: {
      suggestedTitle: String,
      suggestedDesc: String,
      suggestedSkills: [String],
      suggestedMembers: Number,
      suggestedRoles: [String],
      creatorRole: { type: String, default: "Project Lead" },
      analyzedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

ProjectSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.model("Project", ProjectSchema);