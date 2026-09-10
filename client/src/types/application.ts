import type { User } from "./AuthUser";
import type { project } from "./project";

export interface application {
  id: string;
  applicant: User;
  project: project;
  aiMatchScore: number | null;
  aiFeedback: string | null;
  strengths: string[];
  weaknesses: string[];
  message?:string;
  status: "pending" | "accepted" | "rejected";
}