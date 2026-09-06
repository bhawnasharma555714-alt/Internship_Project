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
    const userId = req.user.id;
    const { bio, skills, interests } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : [];
    }
    if (interests !== undefined) {
      user.interests = Array.isArray(interests) ? interests : [];
    }

    await user.save(); // Persists update directly to MongoDB Atlas/local DB

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      githubId: user.githubId || null,
      githubUsername: user.githubUsername || null,
      googleId: user.googleId || null,
    });
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};