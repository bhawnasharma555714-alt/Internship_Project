export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  location?: string;
  university?: string;
  jobProfile?: string;
  branch?: string;
  githubId: string | null;
  githubUsername?: string;
}

