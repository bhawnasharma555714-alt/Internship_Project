import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    message: { type: String, default: "" },
    aiMatchScore: { type: Number, default: null },
    assignedRole: { type: String, default: "Team Contributor" },
    aiFeedback: { type: String, default: null },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    acceptedAt: { type: Date, default: null }
}, { timestamps: true });

ApplicationSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

export default mongoose.model("Application", ApplicationSchema);