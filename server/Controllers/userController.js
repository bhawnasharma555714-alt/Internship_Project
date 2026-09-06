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

// Controllers/userController.js (or wherever updateProfile lives)
export const updateProfile = async (req, res) => {
  try {
    const { bio, skills, interests } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [];
    if (interests !== undefined) user.interests = Array.isArray(interests) ? interests : [];

    await user.save(); // Ensures MongoDB persists the array change

    return res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};