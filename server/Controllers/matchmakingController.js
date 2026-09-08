// Controllers/matchmakingController.js
import User from '../Models/userModel.js';
import GithubSkillProfile from '../Models/githubSkillProfileModel.js';
import Project from '../Models/projectModel.js'; // Assumes Project model exists with requiredSkills array

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
export const getRecommendedProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch User Profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 2. Fetch Cached GitHub Skill Profile
    const skillProfile = await GithubSkillProfile.findOne({ userId });

    // Build lookup maps for fast matching
    const supportedSkillsMap = new Map();
    if (skillProfile && skillProfile.evidencedSkills) {
      skillProfile.evidencedSkills.forEach((item) => {
        supportedSkillsMap.set(item.skillName.toLowerCase(), item.confidenceScore || 50);
      });
    }

    const userSkillsRaw = user.skills || [];
    const claimedSkillsLower = userSkillsRaw.map((s) => s.trim().toLowerCase());

    // 3. Fetch Open Projects (Excluding projects created by the user)
    const openProjects = await Project.find({
      ownerId: { $ne: userId },
      status: { $ne: 'closed' },
    }).populate('ownerId', 'name email avatar');

    // 4. Calculate Match Scores
    const recommendations = openProjects.map((project) => {
      const projectData = project.toObject ? project.toObject() : project;
      const requiredSkills = project.requiredSkills || [];

      const matchAnalysis = calculateProjectMatch(
        requiredSkills,
        supportedSkillsMap,
        claimedSkillsLower
      );

      return {
        project: projectData,
        matchPercentage: matchAnalysis.matchPercentage,
        matchedSkills: matchAnalysis.matchedSkills,
        missingSkills: matchAnalysis.missingSkills,
      };
    });

    // 5. Sort Projects by Match Percentage descending
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json({
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('Matchmaking Engine Error:', error.message);
    return res.status(500).json({ message: 'Failed to generate project recommendations.' });
  }
};