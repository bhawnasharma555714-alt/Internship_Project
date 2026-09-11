import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeTeamSkillGap({ project, teamMembers }) {
  const projectSkills = project.requiredSkills || [];
  const projectRoles = project.aiAnalysis?.suggestedRoles || [];

  const memberProfiles = teamMembers.map((m) => ({
    name: m.name || "Team Member",
    skills: m.skills || [],
    bio: m.bio || "",
  }));

  const prompt = `
You are a technical project manager evaluating a project team's skill composition.

Analyze the gap between the project's requirements and the current accepted team members.

--- PROJECT DETAILS ---
Title: ${project.title}
Description: ${project.desc}
Required Skills: ${projectSkills.join(", ") || "None listed"}
Target Roles: ${projectRoles.join(", ") || "General Team"}

--- CURRENT ACCEPTED TEAM MEMBERS (${memberProfiles.length}) ---
${JSON.stringify(memberProfiles, null, 2)}

--- TASK ---
Return ONLY raw JSON matching this format:
{
  "readinessScore": number (0 to 100),
  "coveredSkills": ["skill 1", "skill 2"],
  "missingSkills": ["missing skill 1", "missing skill 2"],
  "recommendedRolesToHire": ["Role to recruit next 1", "Role 2"],
  "insights": "2-sentence actionable advice on what the creator should focus on hiring or learning next."
}

Rules:
- Keep list items concise (1-3 words per skill/role).
- Do NOT include markdown backticks or text outside raw JSON.
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text;
  if (!text || text.trim() === "") {
    throw new Error("Gemini returned an empty skill-gap analysis.");
  }

  const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanedText);
}