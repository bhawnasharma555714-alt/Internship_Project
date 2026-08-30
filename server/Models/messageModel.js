import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    project: {type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true},
    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User",required: true},
    message: {type: String, required: true},
    createdAt: {type: Date,default: Date.now}
});

MessageSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

export default mongoose.model("Message", MessageSchema);