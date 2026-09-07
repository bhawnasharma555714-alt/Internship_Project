// Controllers/githubSkillsController.js
import User from '../Models/userModel.js';
import GithubSkillProfile from '../Models/githubSkillProfileModel.js';
import { getUserRepos, getUserCommits, getCommitDiff } from '../utils/githubApiClient.js';
import { extractSkillsFromDiffFiles } from '../utils/skillAnalyzer.js';

// Helper function to dynamically calculate categories based on current user skills
const categorizeSkills = (userSkillsRaw = [], evidencedList = []) => {
  const userSkillsLower = userSkillsRaw.map((s) => s.trim().toLowerCase());

  const evidencedMap = new Map();
  evidencedList.forEach((ev) => {
    evidencedMap.set(ev.skillName.toLowerCase(), ev.skillName);
  });

  const supportedSkills = [];
  const claimedOnlySkills = [];

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

    const existingProfile = await GithubSkillProfile.findOne({ userId });
    const COOLDOWN_HOURS = parseInt(process.env.ANALYSIS_COOLDOWN_HOURS || '168', 10); // Default: 168h (7 days)
    const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

    const isForce = req.query.force === 'true';
    // Check Cooldown Period
    if (existingProfile && !isForce) {
      const timeSinceLast = Date.now() - new Date(existingProfile.lastAnalyzedAt).getTime();

      if (timeSinceLast < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - timeSinceLast;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        const remainingDays = Math.ceil(remainingHours / 24);

        const timeDisplay = COOLDOWN_HOURS >= 24 
          ? `${remainingDays} day(s)` 
          : `${remainingHours} hour(s)`;

        return res.status(429).json({
          error: 'COOLDOWN_ACTIVE',
          message: `Analysis cooldown active. Please wait ${timeDisplay} before re-analyzing or run a forced analysis.`,
        });
      }
    }
    // Run Full Analysis Engine
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

    let profileToSave = existingProfile;
    if (!profileToSave) {
      profileToSave = new GithubSkillProfile({ userId });
    }

    profileToSave.lastAnalyzedAt = new Date();
    profileToSave.evidencedSkills = evidencedList;
    profileToSave.outputSummary = liveSummary;

    await profileToSave.save();

    return res.json({
      message: 'GitHub skill analysis completed successfully.',
      profile: {
        ...profileToSave.toObject(),
        outputSummary: liveSummary,
      },
    });
  } catch (error) {
    console.error('GitHub Skill Analysis Error:', error.message);
    return res.status(500).json({ message: 'Failed to analyze GitHub skills.' });
  }
};

/**
 * Fetch cached GitHub skill profile
 * GET /api/github-skills
 */
export const getGithubSkillProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await GithubSkillProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'No skill analysis found.' });
    }

    const liveSummary = categorizeSkills(user.skills || [], profile.evidencedSkills || []);

    return res.json({
      ...profile.toObject(),
      outputSummary: liveSummary,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving skill profile.' });
  }
};