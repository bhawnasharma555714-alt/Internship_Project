import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    membersRequired: { type: Number, default: 1 },

    aiAnalysis: {
        suggestedTitle: String,
        suggestedDesc: String,
        suggestedSkills: [String],
        suggestedMembers: Number,
        suggestedRoles: [String],
        creatorRole: { type: String, default: "Project Lead" },
        analyzedAt: { type: Date, default: Date.now },
    },
}, { timestamps: true });

ProjectSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

export default mongoose.model("Project", ProjectSchema);