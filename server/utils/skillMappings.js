// utils/skillMappings.js

export const EXTENSION_MAP = {
  // Web Core
  js: 'JavaScript',
  jsx: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  html: 'HTML',
  css: 'CSS',

  // Mobile Development
  kt: 'Kotlin',
  kts: 'Kotlin',
  dart: 'Flutter',
  swift: 'Swift',
  java: 'Java/Android',

  // AI, Data Science & Backend
  py: 'Python',
  ipynb: 'Jupyter / Data Science',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  rs: 'Rust',
};

export const STATIC_DEPENDENCY_DICT = {
  // GenAI & LLM Ecosystem
  'openai': 'GenAI / OpenAI',
  '@google/genai': 'GenAI / Gemini',
  '@google/generative-ai': 'GenAI / Gemini',
  'google-generativeai': 'GenAI / Gemini',
  'langchain': 'LangChain / LLM',
  'langchain-core': 'LangChain / LLM',
  '@langchain/core': 'LangChain / LLM',
  'transformers': 'GenAI / HuggingFace',
  'ollama': 'GenAI / Ollama',
  'pinecone-client': 'Vector DB / Pinecone',
  'chromadb': 'Vector DB / Chroma',

  // Mobile Frameworks
  'react-native': 'React Native',
  'expo': 'Expo / React Native',

  // Core Web & Database
  'react': 'React',
  'express': 'Express.js',
  'mongodb': 'MongoDB',
  'mongoose': 'MongoDB',
  'tailwindcss': 'Tailwind CSS',
};

// Regex patterns to capture GenAI imports, models, and API calls inside diff patches
export const GENAI_INLINE_PATTERNS = [
  { pattern: /(?:google\.generativeai|GoogleGenAI|gemini-2\.|gemini-1\.5)/i, skill: 'GenAI / Gemini' },
  { pattern: /(?:openai|ChatOpenAI|gpt-4|gpt-3\.5)/i, skill: 'GenAI / OpenAI' },
  { pattern: /(?:langchain|PromptTemplate|LLMChain)/i, skill: 'LangChain / LLM' },
];