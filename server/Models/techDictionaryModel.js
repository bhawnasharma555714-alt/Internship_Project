// Models/techDictionaryModel.js
import mongoose from 'mongoose';

const techDictionarySchema = new mongoose.Schema(
  {
    dependencyName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    associatedSkill: {
      type: String,
      required: true,
    },
    resolvedBy: {
      type: String,
      enum: ['static', 'gemini'],
      default: 'static',
    },
  },
  { timestamps: true }
);

export default mongoose.model('TechDictionary', techDictionarySchema);