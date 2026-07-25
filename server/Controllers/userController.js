import User from '../Models/userModel.js'
import Application from "../Models/applicationModel.js";
import Project from "../Models/projectModel.js";

export const getProfile = async(req,res) => {
    try{
        const userId = req.user.id;
        const userProfile = await User.findById(userId);
        if(!userProfile){
            return res.status(404).json({error:"User Not Found!!"});
        }
        res.status(200).json(userProfile);
    }catch(err){
         res.status(500).json({error: "Server Error", e:err.message});
    }
}

export const updateProfile = async(req,res) => {
    try{
        const userId = req.user.id;
        const {bio, skills, interests} = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId,
            {   bio:bio,
                skills:skills,
                interests:interests
            }, 
            {new:true}
        );
        if(!updatedUser){
            return res.status(404).json({error:"User Not Found!!"});
        }
        res.status(200).json(updatedUser);
    }catch(err){
         res.status(500).json({error: "Server Error", e:err.message});
    }
}