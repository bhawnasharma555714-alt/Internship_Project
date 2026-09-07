// Controllers/githubSkillsController.js
import User from '../Models/userModel.js';
import GithubSkillProfile from '../Models/githubSkillProfileModel.js';
import { getUserRepos, getUserCommits, getCommitDiff } from '../utils/githubApiClient.js';
import { extractSkillsFromDiffFiles } from '../utils/skillAnalyzer.js';

// Weight mapping for confidence calculation
const getSourceWeight = (matchedBy) => {
  switch (matchedBy) {
    case 'package_dep':
    case 'python_dep':
      return 40; // High confidence (explicit dependency declaration)
    case 'import_regex':
      return 25; // Direct import statement
    case 'inline_code_match':
      return 15; // Code snippet match
    case 'gemini_ai_resolver':
      return 15; // AI resolved package
    case 'extension':
      return 10; // File extension present
    default:
      return 5;
  }
};

// Calculate normalized 0-100% confidence score per skill
const processEvidencedSkills = (evidencedList = []) => {
  return evidencedList.map((item) => {
    let rawScore = 0;
    const sources = item.sources || [];

    sources.forEach((src) => {
      rawScore += getSourceWeight(src.matchedBy);
    });

    const confidenceScore = Math.min(Math.round(rawScore), 100);

    return {
      skillName: item.skillName,
      confidenceScore: confidenceScore || item.confidenceScore || 10,
      sources: item.sources,
    };
  });
};

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

    const processedEvidenced = processEvidencedSkills(profile.evidencedSkills || []);
    const liveSummary = categorizeSkills(user.skills || [], processedEvidenced);

    const profileData = profile.toObject ? profile.toObject() : profile;

    return res.json({
      ...profileData,
      evidencedSkills: processedEvidenced,
      outputSummary: liveSummary,
    });
  } catch (error) {
    console.error('Error retrieving skill profile:', error.message);
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
        error: 'GITHUB_NOT_LINKED',
        message: 'Please link your GitHub account before running a skill analysis.',
      });
    }

    const existingProfile = await GithubSkillProfile.findOne({ userId });
    const COOLDOWN_HOURS = parseInt(process.env.ANALYSIS_COOLDOWN_HOURS || '168', 10);
    const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;
    const isForce = req.query.force === 'true';

    // Cooldown Check
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

    if (!repos || repos.length === 0) {
      return res.status(404).json({
        error: 'NO_REPOSITORIES_FOUND',
        message: 'No public or contributed repositories found on your GitHub account.',
      });
    }

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

        const detected = await extractSkillsFromDiffFiles(files, repo.name);
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

    const rawEvidencedList = Array.from(aggregatedEvidencedSkills.values());
    const processedEvidenced = processEvidencedSkills(rawEvidencedList);
    const liveSummary = categorizeSkills(user.skills || [], processedEvidenced);

    let profileToSave = existingProfile;
    if (!profileToSave) {
      profileToSave = new GithubSkillProfile({ userId });
    }

    profileToSave.lastAnalyzedAt = new Date();
    profileToSave.evidencedSkills = processedEvidenced;
    profileToSave.outputSummary = liveSummary;

    await profileToSave.save();

    const profileData = profileToSave.toObject ? profileToSave.toObject() : profileToSave;

    return res.json({
      message: 'GitHub skill analysis completed successfully.',
      profile: {
        ...profileData,
        evidencedSkills: processedEvidenced,
        outputSummary: liveSummary,
      },
    });
  } catch (error) {
    console.error('GitHub Skill Analysis Catch Error:', error);

    if (error.message === 'GITHUB_TOKEN_EXPIRED' || error.response?.status === 401) {
      return res.status(401).json({
        error: 'GITHUB_TOKEN_EXPIRED',
        message: 'Your GitHub session has expired. Please re-link your GitHub account.',
      });
    }

    if (error.response?.status === 403 && error.response?.headers?.['x-ratelimit-remaining'] === '0') {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'GitHub API rate limit reached. Please wait a few minutes before trying again.',
      });
    }

    if (error.message?.includes('GEMINI') || error.status === 503) {
      return res.status(503).json({
        error: 'AI_SERVICE_UNAVAILABLE',
        message: 'AI skill resolution service is temporarily unavailable. Try again shortly.',
      });
    }

    return res.status(500).json({
      error: 'ANALYSIS_FAILED',
      message: error.response?.data?.message || error.message || 'Failed to complete GitHub skill analysis.',
    });
  }
};