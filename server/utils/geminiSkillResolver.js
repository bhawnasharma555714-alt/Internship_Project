// utils/geminiSkillResolver.js
import { GoogleGenAI } from '@google/genai';
import TechDictionary from '../Models/techDictionaryModel.js';

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

/**
 * Resolves an unknown package/dependency name to a normalized technical skill.
 * Checks global TechDictionary DB cache first; falls back to Gemini if unknown.
 * 
 * @param {String} dependencyName - The raw dependency string (e.g., "zod", "sqlalchemy")
 * @returns {Promise<String|null>} The mapped skill name or null if unresolvable
 */
export const resolveUnknownDependency = async (dependencyName) => {
  if (!dependencyName) return null;
  const cleanDep = dependencyName.toLowerCase().trim();

  // 1. Check Global DB Cache first (Zero Gemini Token Cost)
  const cached = await TechDictionary.findOne({ dependencyName: cleanDep });
  if (cached) {
    return cached.associatedSkill;
  }

  // If no Gemini API key is configured, exit gracefully
  if (!ai) {
    return null;
  }

  try {
    // 2. Fallback to Gemini for unknown packages using @google/genai
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a software engineering skill classifier. Return ONLY the primary canonical technology or framework name associated with the package "${cleanDep}" in 1 to 3 words max (e.g., "zod" -> "TypeScript", "sqlalchemy" -> "Python", "framer-motion" -> "React"). If it is a generic utility with no clear primary skill, return "UNKNOWN". Do not include quotes, punctuation, or extra words.`,
    });

    const resolvedSkill = response.text?.trim();

    if (!resolvedSkill || resolvedSkill.toUpperCase() === 'UNKNOWN') {
      return null;
    }

    // 3. Cache the resolved result globally so cost is paid once across all users
    await TechDictionary.create({
      dependencyName: cleanDep,
      associatedSkill: resolvedSkill,
      resolvedBy: 'gemini',
    });

    return resolvedSkill;
  } catch (error) {
    console.error(`Gemini resolution error for dependency "${cleanDep}":`, error.message);
    return null;
  }
};