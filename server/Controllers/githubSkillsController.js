// Controllers/githubSkillsController.js
import User from '../Models/userModel.js';
import GithubSkillProfile from '../Models/githubSkillProfileModel.js';
import { getUserRepos, getUserCommits, getCommitDiff } from '../utils/githubApiClient.js';
import { extractSkillsFromDiffFiles } from '../utils/skillAnalyzer.js';

// Helper function to dynamically calculate the 3 categories based on CURRENT user skills
const categorizeSkills = (userSkillsRaw = [], evidencedList = []) => {
  const userSkillsLower = userSkillsRaw.map((s) => s.trim().toLowerCase());

  // Map of evidenced skill names (lowercase -> canonical formatted name)
  const evidencedMap = new Map();
  evidencedList.forEach((ev) => {
    evidencedMap.set(ev.skillName.toLowerCase(), ev.skillName);
  });

  const supportedSkills = [];
  const claimedOnlySkills = [];

  // 1. Check user's claimed profile skills against evidence
  userSkillsRaw.forEach((userSkill) => {
    const trimmed = userSkill.trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();

    if (evidencedMap.has(normalized)) {
      supportedSkills.push(evidencedMap.get(normalized));
    } else {
      claimedOnlySkills.push(trimmed);
    }
  });

  // 2. Suggested Skills = Found in commits BUT NOT in user's claimed skills
  const suggestedSkills = [];
  evidencedList.forEach((ev) => {
    const evLower = ev.skillName.toLowerCase();
    if (!userSkillsLower.includes(evLower)) {
      suggestedSkills.push(ev.skillName);
    }
  });

  return {
    supportedSkills: [...new Set(supportedSkills)],
    claimedOnlySkills: [...new Set(claimedOnlySkills)],
    suggestedSkills: [...new Set(suggestedSkills)],
  };
};

/**
 * Fetch cached GitHub skill analysis for logged-in user
 * GET /api/github-skills
 */
export const getGithubSkillProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await GithubSkillProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'No skill analysis found.' });
    }

    // DYNAMIC RE-CATEGORIZATION: Recalculate categories against latest user.skills
    const liveSummary = categorizeSkills(user.skills || [], profile.evidencedSkills || []);

    return res.json({
      ...profile.toObject(),
      outputSummary: liveSummary,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving skill profile.' });
  }
};

/**
 * Run GitHub Skill Analysis
 * GET /api/github-skills/analyze
 */
export const analyzeGithubSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('+githubAccessToken');

    if (!user || !user.githubId || !user.githubAccessToken) {
      return res.status(400).json({
        message: 'Please link your GitHub account before running skill analysis.',
      });
    }

    let existingProfile = await GithubSkillProfile.findOne({ userId });
    const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

    // Cache check
    if (existingProfile && !req.query.force) {
      const timeSinceLast = Date.now() - new Date(existingProfile.lastAnalyzedAt).getTime();
      if (timeSinceLast < COOLDOWN_MS) {
        const liveSummary = categorizeSkills(user.skills || [], existingProfile.evidencedSkills || []);
        return res.json({
          fromCache: true,
          message: 'Retrieved skill analysis from cache.',
          profile: {
            ...existingProfile.toObject(),
            outputSummary: liveSummary,
          },
        });
      }
    }

    // Fetch repositories and commits
    const repos = await getUserRepos(user.githubAccessToken);
    const aggregatedEvidencedSkills = new Map();

    for (const repo of repos) {
      const commits = await getUserCommits(
        user.githubAccessToken,
        repo.owner.login,
        repo.name,
        user.githubUsername
      );

      for (const commit of commits) {
        const files = await getCommitDiff(
          user.githubAccessToken,
          repo.owner.login,
          repo.name,
          commit.sha
        );

        const detected = extractSkillsFromDiffFiles(files, repo.name);
        detected.forEach((skillItem) => {
          if (!aggregatedEvidencedSkills.has(skillItem.skillName)) {
            aggregatedEvidencedSkills.set(skillItem.skillName, skillItem);
          } else {
            const existing = aggregatedEvidencedSkills.get(skillItem.skillName);
            existing.confidenceScore += skillItem.confidenceScore;
            existing.sources.push(...skillItem.sources);
          }
        });
      }
    }

    const evidencedList = Array.from(aggregatedEvidencedSkills.values());
    const liveSummary = categorizeSkills(user.skills || [], evidencedList);

    if (!existingProfile) {
      existingProfile = new GithubSkillProfile({ userId });
    }

    existingProfile.lastAnalyzedAt = new Date();
    existingProfile.evidencedSkills = evidencedList;
    existingProfile.outputSummary = liveSummary;

    await existingProfile.save();

    return res.json({
      fromCache: false,
      message: 'GitHub skill analysis completed successfully.',
      profile: {
        ...existingProfile.toObject(),
        outputSummary: liveSummary,
      },
    });
  } catch (error) {
    console.error('GitHub Skill Analysis Error:', error.message);
    return res.status(500).json({ message: 'Failed to analyze GitHub skills.' });
  }
};