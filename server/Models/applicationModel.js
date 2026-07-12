import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    applicant: { type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
    project: { type: mongoose.Schema.Types.ObjectId,ref: "Project",required: true},
    aiMatchScore:{type:Number , default:null},
    aiFeedback: {type:String, default:null},
    strengths: {type:[String], default:[]},
    weaknesses: {type:[String], default:[]},
    status:{type:String, enum: ["pending", "accepted", "rejected"], default:"pending"}
})

ApplicationSchema.set("toJSON", {  
  transform: (doc, ret) => {  
    ret.id = ret._id.toString();  
    delete ret._id; 
    delete ret.__v;  
  }  
});  

export default mongoose.model("Application", ApplicationSchema);