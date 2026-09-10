// Controllers/matchmakingController.js
import User from '../Models/userModel.js';
import GithubSkillProfile from '../Models/githubSkillProfileModel.js';
import Project from '../Models/projectModel.js'; // Assumes Project model exists with requiredSkills array
import Application from "../Models/applicationModel.js";

/**
 * Calculates a weighted match percentage between user skills and project requirements.
 *
 * Weighting Formula:
 * - Supported Skill (Verified by GitHub): 1.0 base multiplier + (Confidence Score / 200) bonus
 * - Claimed Skill (Manual entry): 0.5 base multiplier
 * - Unmatched Required Skill: 0 points
 */
const calculateProjectMatch = (projectSkills = [], supportedSkillsMap = new Map(), claimedSkillsLower = []) => {
  if (!projectSkills || projectSkills.length === 0) {
    return { matchPercentage: 0, matchedSkills: [], missingSkills: [] };
  }

  let totalPossibleScore = projectSkills.length * 1.5; // Max potential score per skill is 1.5
  let earnedScore = 0;

  const matchedSkills = [];
  const missingSkills = [];

  projectSkills.forEach((reqSkill) => {
    const trimmed = reqSkill.trim();
    if (!trimmed) return;

    const reqLower = trimmed.toLowerCase();

    // 1. Check if user has GitHub Supported Skill (Highest weight)
    if (supportedSkillsMap.has(reqLower)) {
      const confidence = supportedSkillsMap.get(reqLower); // Score from 0 to 100
      const confidenceBonus = (confidence / 100) * 0.5; // Max bonus 0.5
      const skillScore = 1.0 + confidenceBonus;

      earnedScore += skillScore;
      matchedSkills.push({
        skillName: trimmed,
        type: 'supported',
        confidenceScore: confidence,
      });
    }
    // 2. Check if user has Claimed Skill (Medium weight)
    else if (claimedSkillsLower.includes(reqLower)) {
      earnedScore += 0.5;
      matchedSkills.push({
        skillName: trimmed,
        type: 'claimed',
        confidenceScore: 0,
      });
    }
    // 3. Missing Skill
    else {
      missingSkills.push(trimmed);
    }
  });

  // Calculate final normalized percentage (capped at 100%)
  const matchPercentage = Math.min(
    Math.round((earnedScore / totalPossibleScore) * 100),
    100
  );

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
  };
};

/**
 * Get Recommended Projects for Logged-In User
 * GET /api/matchmaking/recommendations
 */
// Controllers/matchmakingController.js
export const getRecommendedProjects = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({ message: "User ID missing from authentication token." });
    }

    // 1. Fetch current user details
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Fetch all project IDs where the user has already applied
    const existingApplications = await Application.find({ applicant: userId }).select("project");
    const appliedProjectIds = existingApplications.map((app) => app.project.toString());

    // 3. Fetch open projects excluding:
    //    a) Projects created by the user ($ne: userId)
    //    b) Projects the user has already applied to ($nin: appliedProjectIds)
    const projects = await Project.find({
      creator: { $ne: userId },
      _id: { $nin: appliedProjectIds },
    }).populate("creator", "name bio email");

    // 4. Calculate skill match metrics for each project
    const recommendations = projects.map((project) => {
      const requiredSkills = Array.isArray(project.requiredSkills) ? project.requiredSkills : [];
      const userSkills = Array.isArray(currentUser.skills) ? currentUser.skills : [];

      // Cleaned arrays for case-insensitive matching
      const userSkillsLower = userSkills.map((s) => s.trim().toLowerCase());

      const matchedSkills = requiredSkills.filter((skill) =>
        userSkillsLower.includes(skill.trim().toLowerCase())
      );

      const missingSkills = requiredSkills.filter(
        (skill) => !userSkillsLower.includes(skill.trim().toLowerCase())
      );

      // Percentage calculation rounded to nearest whole integer
      const matchPercentage =
        requiredSkills.length > 0
          ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
          : 0;

      return {
        project,
        matchPercentage,
        matchedSkills,
        missingSkills,
      };
    });

    // 5. Sort recommendations by highest match score first
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.status(200).json({
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("🔥 Matchmaking Engine Error Stack:", error);

    return res.status(500).json({
      message: "Failed to generate project recommendations.",
      error: error.message,
    });
  }
};