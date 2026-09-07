// Models/githubSkillProfileModel.js
import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema({
  repoName: { type: String, required: true },
  filePath: { type: String, required: true },
  matchedBy: {
    type: String,
    enum: [
      'extension',
      'package_dep',
      'python_dep',
      'import_regex',
      'inline_code_match', // Added for GenAI inline patterns
      'gemini_ai_resolver', // Added for Gemini AI package resolution
      'agile_docs',
      'doc_files',
      'design_artifact',
    ],
    required: true,
  },
});

const evidencedSkillSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  confidenceScore: { type: Number, default: 1 },
  sources: [sourceSchema],
});

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
    evidencedSkills: [evidencedSkillSchema],
    outputSummary: {
      supportedSkills: [String],
      claimedOnlySkills: [String],
      suggestedSkills: [String],
    },
  },
  { timestamps: true }
);

const GithubSkillProfile =
  mongoose.models.GithubSkillProfile ||
  mongoose.model('GithubSkillProfile', githubSkillProfileSchema);

export default GithubSkillProfile;