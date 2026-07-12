import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    bio: {type:String, default:""},
    skills: {type:[String], default:[]},
    interests: {type:[String],default:[]}
})

userSchema.set("toJSON", {  
  transform: (doc, ret) => {  
    ret.id = ret._id.toString();  
    delete ret._id;  
    delete ret.password;  
    delete ret.__v;  
  }  
});  

export default mongoose.model("User", userSchema);