// utils/skillAnalyzer.js
import { EXTENSION_MAP, STATIC_DEPENDENCY_DICT, GENAI_INLINE_PATTERNS } from './skillMappings.js';
import { resolveUnknownPackages } from './geminiSkillResolver.js';

export const extractSkillsFromDiffFiles = async (files, repoName) => {
  const detectedSkillsMap = new Map();
  const unknownPackages = new Set();

  files.forEach((file) => {
    const filename = file.filename || '';
    const patch = file.patch || '';
    const lowerFilename = filename.toLowerCase();
    const fileExt = filename.split('.').pop()?.toLowerCase();

    // 1. Extension Detection
    if (fileExt && EXTENSION_MAP[fileExt]) {
      addDetectedSkill(detectedSkillsMap, EXTENSION_MAP[fileExt], {
        repoName,
        filePath: filename,
        matchedBy: 'extension',
      });
    }

    // 2. npm package.json parsing
    if (lowerFilename.endsWith('package.json')) {
      const addedDeps = extractAddedNpmDependencies(patch);
      addedDeps.forEach((dep) => {
        if (STATIC_DEPENDENCY_DICT[dep]) {
          addDetectedSkill(detectedSkillsMap, STATIC_DEPENDENCY_DICT[dep], {
            repoName,
            filePath: filename,
            matchedBy: 'package_dep',
          });
        } else {
          unknownPackages.add(dep);
        }
      });
    }

    // 3. Python dependency parsing
    if (
      lowerFilename.endsWith('requirements.txt') ||
      lowerFilename.endsWith('pyproject.toml') ||
      lowerFilename.endsWith('pipfile')
    ) {
      const addedPyDeps = extractAddedPythonDependencies(patch);
      addedPyDeps.forEach((dep) => {
        if (STATIC_DEPENDENCY_DICT[dep]) {
          addDetectedSkill(detectedSkillsMap, STATIC_DEPENDENCY_DICT[dep], {
            repoName,
            filePath: filename,
            matchedBy: 'python_dep',
          });
        } else {
          unknownPackages.add(dep);
        }
      });
    }

    // 4. Inline GenAI Code & Pattern Matching
    if (patch) {
      GENAI_INLINE_PATTERNS.forEach(({ pattern, skill }) => {
        if (pattern.test(patch)) {
          addDetectedSkill(detectedSkillsMap, skill, {
            repoName,
            filePath: filename,
            matchedBy: 'inline_code_match',
          });
        }
      });
    }
  });

  // 5. Query Gemini AI for unknown packages
  if (unknownPackages.size > 0) {
    const resolvedMap = await resolveUnknownPackages(Array.from(unknownPackages));
    Object.entries(resolvedMap).forEach(([dep, skillName]) => {
      files.forEach((file) => {
        const filename = file.filename || '';
        addDetectedSkill(detectedSkillsMap, skillName, {
          repoName,
          filePath: filename,
          matchedBy: 'gemini_ai_resolver',
        });
      });
    });
  }

  return Array.from(detectedSkillsMap.values());
};

const extractAddedNpmDependencies = (patchText) => {
  const addedDeps = [];
  patchText.split('\n').forEach((line) => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      const match = line.match(/"([^"]+)":\s*"[^"]+"/);
      if (match && match[1]) addedDeps.push(match[1].toLowerCase());
    }
  });
  return addedDeps;
};

const extractAddedPythonDependencies = (patchText) => {
  const addedDeps = [];
  patchText.split('\n').forEach((line) => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      const cleanLine = line.substring(1).trim().toLowerCase();
      const match = cleanLine.match(/^([a-zA-Z0-9_-]+)/);
      if (match && match[1]) addedDeps.push(match[1]);
    }
  });
  return addedDeps;
};

const addDetectedSkill = (skillsMap, skillName, source) => {
  if (!skillsMap.has(skillName)) {
    skillsMap.set(skillName, {
      skillName,
      confidenceScore: 1,
      sources: [source],
    });
  } else {
    const existing = skillsMap.get(skillName);
    existing.confidenceScore += 1;
    existing.sources.push(source);
  }
};