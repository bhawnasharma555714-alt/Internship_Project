
export interface project{
    id : string;
    title: string;
    desc : string;
    requiredSkills: string[];
    membersRequired: number;
    creator?: {
        id:string;
        name:string;
        bio?:string
    };
    applicantCount: number;
}
export interface AIAnalysis {
  suggestedTitle?: string;
  suggestedDesc?: string;
  suggestedSkills?: string[];
  suggestedMembers?: number;
  suggestedRoles?: string[];
  analyzedAt?: string | Date;
}
