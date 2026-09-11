import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeProjectDraft({ title, desc, requiredSkills, membersRequired }) {
  const skillsStr = Array.isArray(requiredSkills) ? requiredSkills.join(", ") : "";

  const prompt = `
You are a peer developer assisting a university student with their project post.

Optimize the following project draft to make it sound enthusiastic, clear, and beginner/student-friendly. Avoid overly corporate, dense, or formal jargon. It should sound like an excited student looking for teammates for a hackathon or campus project.

Draft Details:
Title: ${title || "N/A"}
Description: ${desc || "N/A"}
Required Skills: ${skillsStr || "None specified"}
Members Required: ${membersRequired || 1}

Return ONLY valid JSON in the following format:
{
  "suggestedTitle": "a clear, casual, catchy project title",
  "suggestedDesc": "an easy-to-read, conversational description under 100 words",
  "suggestedSkills": ["skill1", "skill2"],
  "suggestedMembers": number,
  "suggestedRoles": ["Role 1", "Role 2"]
}

Rules:
- Keep suggestedDesc clear, casual, and conversational.
- Keep tone direct and friendly without heavy corporate buzzwords.
- Do NOT include markdown backticks or extra text outside raw JSON.
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text;
  if (!text || text.trim() === "") {
    throw new Error("Gemini returned an empty response.");
  }

  const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanedText);
}

export async function determineCreatorRole(creatorProfile, project) {
    const creatorSkills = Array.isArray(creatorProfile.skills) ? creatorProfile.skills.join(", ") : "";
    const projectSkills = Array.isArray(project.requiredSkills) ? project.requiredSkills.join(", ") : "";

    const prompt = `
You are an AI recruitment advisor.

Based on the creator's profile and the project details they just published, determine the SINGLE most accurate leadership/technical role for the creator on this project (e.g., "Full-Stack Lead", "Frontend Lead & PM", "AI System Architect").

Creator Profile:
Name: ${creatorProfile.name || "Creator"}
Bio: ${creatorProfile.bio || "N/A"}
Skills: ${creatorSkills || "N/A"}

Project Details:
Title: ${project.title}
Description: ${project.desc}
Required Skills: ${projectSkills}

Return ONLY raw JSON in this exact format:
{
  "creatorRole": "Concise Role Title (e.g. Technical Lead & Backend Engineer)"
}
`;

    try {
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text;
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        return parsed.creatorRole || "Project Lead";
    } catch (err) {
        console.error("Creator Role Assignment Error:", err.message);
        return "Project Lead";
    }
}