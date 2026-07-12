import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
    title:{type:String,required:true},
    desc: {type:String, reuired:true},
    requiredSkills: {type:[String], default:[]},
    membersRequired: {type:Number,default:1}
})

ProjectSchema.set("toJSON", {  
  transform: (doc, ret) => {  
    ret.id = ret._id.toString();  
    delete ret._id; 
    delete ret.__v;  
  }  
});  

export default mongoose.model("Project", ProjectSchema);