import type { User } from "./AuthUser";

export interface AIAnalysis {
  suggestedTitle?: string;
  suggestedDesc?: string;
  suggestedSkills?: string[];
  suggestedMembers?: number;
  suggestedRoles?: string[];
  creatorRole?: string;
  analyzedAt?: string | Date;
}

export interface project {
  id: string;
  title: string;
  desc: string;
  requiredSkills: string[];
  membersRequired: number;
  members: (User | string)[];
  
  // Phase 1 Scope & Lifecycle Status Fields
  status: "recruitment" | "active" | "completed";
  scope: "campus" | "global";
  universityName: string;

  creator?: User;
  aiAnalysis?: AIAnalysis;
  
  // Dynamic Calculated Fields
  applicantCount?: number;
  acceptedCount?: number;
  activeMembers?: number;
  createdAt?: string;
  updatedAt?: string;
}