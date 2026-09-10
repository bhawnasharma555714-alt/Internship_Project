import User from '../Models/userModel.js'
import Application from "../Models/applicationModel.js";
import Project from "../Models/projectModel.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      skills: user.skills || [],
      interests: user.interests || [],
      githubId: user.githubId || null,
      githubUsername: user.githubUsername || null,
      googleId: user.googleId || null,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { bio, skills, interests, location, university, jobProfile, branch } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          bio,
          skills,
          interests,
          location,
          university,
          jobProfile,
          branch,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};