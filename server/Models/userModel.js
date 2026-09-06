import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:false}, // changed: no longer always required
    bio: {type:String, default:""},
    skills: {type:[String], default:[]},
    interests: {type:[String],default:[]},
    isEmailVerified: {type: Boolean, default: false},
    emailVerificationTokenHash: {type: String, default: null},
    emailVerificationTokenExpiry: {type: Date, default: null},
    resetPasswordTokenHash: {type: String, default: null},
    resetPasswordTokenExpiry: {type: Date, default: null},
    // --- GitHub OAuth fields (new) ---
    githubId: {type: String, default: null, unique: true, sparse: true},
    githubAccessToken: {type: String, default: null, select: false}, // select:false = never returned by default queries
    githubUsername: {type: String, default: null},
    googleId: {
      type: String,
      default: null,
      sparse: true
    },
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
    delete ret.githubAccessToken;
  }  
});  

export default mongoose.model("User", userSchema);  