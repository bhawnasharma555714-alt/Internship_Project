import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function generateAIMatch(candidate,project) {
    const prompt = `
                    You are an AI recruitment assistant.

                    Compare the candidate with the project requirements and evaluate how well the candidate matches the project.

                    Candidate Details:
                    Bio: ${candidate.bio}
                    Skills: ${candidate.skills.join(", ")}
                    Interests: ${candidate.interests.join(", ")}

                    Project Details:
                    Title: ${project.title}
                    Description: ${project.desc}
                    Required Skills: ${project.requiredSkills.join(", ")}

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
                    - Do NOT include markdown.
                    - Do NOT include explanations.
                    - Return ONLY the JSON object.
                    `;
    console.log("About to call Gemini");
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