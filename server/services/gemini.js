import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function generateAIMatch(candidate, project, userMessage = "") {
    const candidateSkills = Array.isArray(candidate.skills) ? candidate.skills.join(", ") : "";
    const candidateInterests = Array.isArray(candidate.interests) ? candidate.interests.join(", ") : "";
    const projectSkills = Array.isArray(project.requiredSkills) ? project.requiredSkills.join(", ") : "";

    const prompt = `
You are an AI recruitment assistant.

Compare the candidate with the project requirements and evaluate how well the candidate matches the project. Also consider their cover note/application message to judge their enthusiasm and tailored approach.

Candidate Details:
Bio: ${candidate.bio || "N/A"}
Skills: ${candidateSkills || "N/A"}
Interests: ${candidateInterests || "N/A"}
Application Message/Cover Note: ${userMessage || "No cover note provided."}

Project Details:
Title: ${project.title || "N/A"}
Description: ${project.desc || project.description || "N/A"}
Required Skills: ${projectSkills || "N/A"}

Return ONLY valid JSON in the following format:

{
    "score": number,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "feedback": "short paragraph"
}

Rules:
- score must be between 0 and 100.
- strengths and weaknesses should each contain 2-4 concise points.
- feedback should be under 60 words.
- Do NOT include markdown formatting or backticks.
- Do NOT include extra explanations.
- Return ONLY the raw JSON object.
`;

    console.log("About to call Gemini with application note...");
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: prompt,
    });

    const text = response.text;
    if (!text || text.trim() === "") {
        throw new Error("Gemini returned an empty response.");
    }

    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Failed to parse Gemini response:", cleanedText);
        throw new Error("Invalid JSON returned by Gemini.");
    }
}