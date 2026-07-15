import type { AuthUser } from "./AuthUser";
import type { project } from "./project";

export interface application {
  id: string;
  applicant: AuthUser;
  project: project;
  aiMatchScore: number | null;
  aiFeedback: string | null;
  strengths: string[];
  weaknesses: string[];
  status: "pending" | "accepted" | "rejected";
}