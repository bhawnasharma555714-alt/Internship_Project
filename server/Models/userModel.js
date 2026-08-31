import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    bio: {type:String, default:""},
    skills: {type:[String], default:[]},
    interests: {type:[String],default:[]},
    // --- Email verification fields (new) ---
    isEmailVerified: {type: Boolean, default: false},
    emailVerificationTokenHash: {type: String, default: null},
    emailVerificationTokenExpiry: {type: Date, default: null},
    resetPasswordTokenHash: {type: String, default: null},
    resetPasswordTokenExpiry: {type: Date, default: null},
})

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
  }  
});

export default mongoose.model("User", userSchema);