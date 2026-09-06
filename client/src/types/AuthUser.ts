export interface AuthUser{
    id: string;
    name: string;
    email: string;
    bio: string;
    skills: string[];
    interests: string[];
    githubId: string | null;
    githubUsername: string | null;
};