// Models/githubSkillProfileModel.js
import mongoose from 'mongoose';

const githubSkillProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    lastAnalyzedAt: {
      type: Date,
      default: Date.now,
    },
    lastCommitShaProcessed: {
      type: String,
      default: null,
    },
    evidencedSkills: [
      {
        skillName: { type: String, required: true },
        confidenceScore: { type: Number, default: 1 }, // Based on commit/diff occurrences
        sources: [
          {
            repoName: String,
            filePath: String,
            matchedBy: {
              type: String,
              enum: ['extension', 'import_regex', 'package_dep', 'gemini'],
            },
          },
        ],
      },
    ],
    outputSummary: {
      supportedSkills: [{ type: String }],
      claimedOnlySkills: [{ type: String }],
      suggestedSkills: [{ type: String }],
    },
  },
  { timestamps: true }
);

export default mongoose.model('GithubSkillProfile', githubSkillProfileSchema);