// utils/skillMappings.js

// File extension to skill mapping
export const EXTENSION_MAP = {
  js: 'JavaScript',
  jsx: 'React',
  ts: 'TypeScript',
  tsx: 'React',
  py: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  go: 'Go',
  rs: 'Rust',
  php: 'PHP',
  rb: 'Ruby',
  kt: 'Kotlin',
  swift: 'Swift',
  html: 'HTML',
  css: 'CSS',
  scss: 'Sass',
  sql: 'SQL',
};

// Static dependency to skill dictionary (Package manager dependencies)
export const STATIC_DEPENDENCY_DICT = {
  // Frontend
  react: 'React',
  'react-dom': 'React',
  vue: 'Vue.js',
  angular: 'Angular',
  svelte: 'Svelte',
  next: 'Next.js',
  tailwindcss: 'Tailwind CSS',
  redux: 'Redux',
  // Backend / Node
  express: 'Express.js',
  mongoose: 'MongoDB',
  prisma: 'Prisma',
  sequelize: 'Sequelize',
  typeorm: 'TypeORM',
  nestjs: 'NestJS',
  // Python
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  pandas: 'Pandas',
  numpy: 'NumPy',
  torch: 'PyTorch',
  tensorflow: 'TensorFlow',
};

// Regex patterns to match import / require statements in diffs
export const IMPORT_REGEX_PATTERNS = [
  // JS/TS: import ... from 'package' or require('package')
  /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
  /require\(['"]([^'"]+)['"]\)/g,
  // Python: import module or from module import ...
  /^\s*import\s+([a-zA-Z0-9_]+)/gm,
  /^\s*from\s+([a-zA-Z0-9_]+)\s+import/gm,
];