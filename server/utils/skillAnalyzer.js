// utils/skillAnalyzer.js
import { EXTENSION_MAP, STATIC_DEPENDENCY_DICT, IMPORT_REGEX_PATTERNS } from './skillMappings.js';

/**
 * Analyzes array of file changes from a single commit diff
 * @param {Array} files - Files array returned by GitHub commit endpoint
 * @param {String} repoName - Repository name for sourcing evidence
 * @returns {Array} List of detected skill evidence objects
 */
export const extractSkillsFromDiffFiles = (files, repoName) => {
  const detectedSkillsMap = new Map();

  files.forEach((file) => {
    const filename = file.filename || '';
    const patch = file.patch || '';
    const fileExt = filename.split('.').pop()?.toLowerCase();

    // 1. Extension Detection
    if (fileExt && EXTENSION_MAP[fileExt]) {
      const skillName = EXTENSION_MAP[fileExt];
      addDetectedSkill(detectedSkillsMap, skillName, {
        repoName,
        filePath: filename,
        matchedBy: 'extension',
      });
    }

    // 2. Package Dependency Diff Parsing
    if (filename.endsWith('package.json')) {
      const addedDependencies = extractAddedNpmDependencies(patch);
      addedDependencies.forEach((dep) => {
        if (STATIC_DEPENDENCY_DICT[dep]) {
          addDetectedSkill(detectedSkillsMap, STATIC_DEPENDENCY_DICT[dep], {
            repoName,
            filePath: filename,
            matchedBy: 'package_dep',
          });
        }
      });
    }

    // 3. Import Statement Regex Matches in Patch Text
    if (patch) {
      IMPORT_REGEX_PATTERNS.forEach((pattern) => {
        let match;
        // Reset regex state
        pattern.lastIndex = 0;
        while ((match = pattern.exec(patch)) !== null) {
          const importedPkg = match[1]?.toLowerCase();
          if (importedPkg && STATIC_DEPENDENCY_DICT[importedPkg]) {
            addDetectedSkill(detectedSkillsMap, STATIC_DEPENDENCY_DICT[importedPkg], {
              repoName,
              filePath: filename,
              matchedBy: 'import_regex',
            });
          }
        }
      });
    }
  });

  return Array.from(detectedSkillsMap.values());
};

/**
 * Parses added lines (+) in package.json patch text to extract dependency names
 */
const extractAddedNpmDependencies = (patchText) => {
  const addedDeps = [];
  const lines = patchText.split('\n');

  lines.forEach((line) => {
    // Only target added lines in diffs
    if (line.startsWith('+') && !line.startsWith('+++')) {
      const match = line.match(/"([^"]+)":\s*"[^"]+"/);
      if (match && match[1]) {
        addedDeps.push(match[1].toLowerCase());
      }
    }
  });

  return addedDeps;
};

/**
 * Helper to aggregate detected skills and source instances
 */
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