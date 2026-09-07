// utils/geminiSkillResolver.js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Local cache to prevent redundant API calls during a single run
const resolvedCache = new Map();

/**
 * Resolves unknown package names to standard skill names using Gemini
 * @param {Array<string>} unknownPackages - List of unknown package names (e.g., ["bunyan", "sqlalchemy"])
 * @returns {Promise<Object>} Mapping of lowercase package name -> Standardized Skill Name
 */
export const resolveUnknownPackages = async (unknownPackages) => {
  const result = {};
  const toQuery = [];

  // 1. Check local cache first
  unknownPackages.forEach((pkg) => {
    const cleanPkg = pkg.toLowerCase().trim();
    if (resolvedCache.has(cleanPkg)) {
      result[cleanPkg] = resolvedCache.get(cleanPkg);
    } else {
      toQuery.push(cleanPkg);
    }
  });

  if (toQuery.length === 0) return result;

  try {
    const prompt = `
You are a developer tooling expert. Given a list of library/package names (npm, pip, crates, etc.), classify each into its standard technology name or skill category (e.g., "prisma" -> "Prisma ORM", "sqlalchemy" -> "SQLAlchemy / Python", "bunyan" -> "Node.js Logging").
If a package is purely utility/internal or obscure, return "UNKNOWN".

Packages to classify:
${toQuery.join('\n')}

Respond STRICTLY in JSON format with key-value pairs where the key is the package name and the value is the standardized skill name:
{
  "package_name": "Standardized Skill Name"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedMappings = JSON.parse(response.text || '{}');

    // 2. Populate result and update cache
    Object.entries(parsedMappings).forEach(([pkg, skillName]) => {
      if (skillName && skillName !== 'UNKNOWN') {
        result[pkg] = skillName;
        resolvedCache.set(pkg, skillName);
      }
    });
  } catch (error) {
    console.error('Gemini Skill Resolver Error:', error.message);
  }

  return result;
};