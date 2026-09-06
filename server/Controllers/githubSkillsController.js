// Controllers/githubSkillsController.js
import User from '../Models/userModel.js';
import GithubSkillProfile from '../Models/githubSkillProfileModel.js';
import { getUserRepos, getUserCommits, getCommitDiff } from '../utils/githubApiClient.js';
import { extractSkillsFromDiffFiles } from '../utils/skillAnalyzer.js';
import { resolveUnknownDependency } from '../utils/geminiSkillResolver.js';

/**
 * Triggers GitHub Skill Analysis for logged-in user
 * GET /api/github-skills/analyze
 */
export const analyzeGithubSkills = async (req, res) => {
  try {
    const userId = req.user.id; // From verifyToken middleware

    // 1. Fetch user & verify GitHub account is attached
    const user = await User.findById(userId).select('+githubAccessToken');
    if (!user || !user.githubId || !user.githubAccessToken) {
      return res.status(400).json({
        message: 'Please link your GitHub account before running skill analysis.',
      });
    }

    // 2. Check Cache / Cooldown Period (~7 days)
    let existingProfile = await GithubSkillProfile.findOne({ userId });
    const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

    if (existingProfile && !req.query.force) {
      const timeSinceLastAnalysis = Date.now() - new Date(existingProfile.lastAnalyzedAt).getTime();
      if (timeSinceLastAnalysis < COOLDOWN_MS) {
        return res.json({
          fromCache: true,
          message: 'Retrieved skill analysis from cache.',
          profile: existingProfile,
        });
      }
    }

    // 3. Fetch user repositories from GitHub REST API
    const repos = await getUserRepos(user.githubAccessToken);
    const aggregatedEvidencedSkills = new Map();

    // 4. Iterate over repositories & analyze author-filtered commits
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

        // Run deterministic extraction on patch diffs
        const detectedInCommit = extractSkillsFromDiffFiles(files, repo.name);

        detectedInCommit.forEach((skillItem) => {
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

    // 5. Categorize into 3-Part Output (Case-Insensitive Matching)
    const userSkillsRaw = user.skills || [];
    const userSkillsLower = userSkillsRaw.map((s) => s.trim().toLowerCase());

    // Build a map of evidenced skill names (lowercase -> canonical skillName)
    const evidencedMap = new Map();
    evidencedList.forEach((ev) => {
      evidencedMap.set(ev.skillName.toLowerCase(), ev.skillName);
    });

    const supportedSkills = [];
    const claimedOnlySkills = [];

    // Categorize user's claimed skills
    userSkillsRaw.forEach((userSkill) => {
      const normalized = userSkill.trim().toLowerCase();
      if (evidencedMap.has(normalized)) {
        supportedSkills.push(evidencedMap.get(normalized));
      } else {
        claimedOnlySkills.push(userSkill.trim());
      }
    });

    // Suggested Skills (found in commits BUT not in user's profile skills)
    const suggestedSkills = [];
    evidencedList.forEach((ev) => {
      const evLower = ev.skillName.toLowerCase();
      if (!userSkillsLower.includes(evLower)) {
        suggestedSkills.push(ev.skillName);
      }
    });

    // 6. Save or update analysis results in MongoDB
    if (!existingProfile) {
      existingProfile = new GithubSkillProfile({ userId });
    }

    existingProfile.lastAnalyzedAt = new Date();
    existingProfile.evidencedSkills = evidencedList;
    existingProfile.outputSummary = {
      supportedSkills: [...new Set(supportedSkills)],
      claimedOnlySkills: [...new Set(claimedOnlySkills)],
      suggestedSkills: [...new Set(suggestedSkills)],
    };

    await existingProfile.save();

    return res.json({
      fromCache: false,
      message: 'GitHub skill analysis completed successfully.',
      profile: existingProfile,
    });
  } catch (error) {
    console.error('GitHub Skill Analysis Error:', error.message);

    if (error.message === 'GITHUB_TOKEN_EXPIRED') {
      return res.status(401).json({
        message: 'Your GitHub session has expired. Please re-link your GitHub account.',
      });
    }

    return res.status(500).json({ message: 'Failed to analyze GitHub skills.' });
  }
};

/**
 * Fetch cached GitHub skill analysis for logged-in user
 * GET /api/github-skills
 */
export const getGithubSkillProfile = async (req, res) => {
  try {
    const profile = await GithubSkillProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'No skill analysis found.' });
    }
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving skill profile.' });
  }
};