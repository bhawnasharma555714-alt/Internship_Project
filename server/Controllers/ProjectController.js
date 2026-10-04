import Project from "../Models/projectModel.js";
import Application from "../Models/applicationModel.js";
import User from "../Models/userModel.js";
import { analyzeProjectDraft } from "../utils/projectAnalyzer.js";
import { analyzeTeamSkillGap } from "../utils/skillGapAnalyzer.js";
import { determineCreatorRole } from "../utils/projectAnalyzer.js";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK with environment API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const createProject = async (req, res) => {
    try {
        const { title, desc, requiredSkills, skillsRequired, membersRequired, memberRequired, aiAnalysis } = req.body;

        if (!title || !desc) {
            return res.status(400).json({ error: "Title and Desc are required" });
        }

        const userId = req.user.id;
        const creatorUser = await User.findById(userId);

        const skills = requiredSkills || skillsRequired || [];
        const members = membersRequired ?? memberRequired ?? 1;

        const skillsArray = Array.isArray(skills) ? skills : skills.split(",").map((s) => s.trim());

        const creatorRole = await determineCreatorRole(creatorUser, {
            title,
            desc,
            requiredSkills: skillsArray,
        });

        const newProject = await Project.create({
            creator: userId,
            title,
            desc,
            requiredSkills: skillsArray,
            membersRequired: Number(members),
            aiAnalysis: {
                ...(aiAnalysis || {}),
                creatorRole,
                analyzedAt: new Date(),
            },
        });

        res.status(201).json(newProject);
    } catch (err) {
        res.status(500).json({ error: "Server Error", e: err.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found!" });
        }

        if (project.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to update this project." });
        }

        const { title, desc, requiredSkills, skillsRequired, membersRequired, memberRequired, aiAnalysis } = req.body;
        const creatorUser = await User.findById(req.user.id);

        const rawSkills = requiredSkills || skillsRequired || project.requiredSkills;
        const skillsArray = Array.isArray(rawSkills) ? rawSkills : rawSkills.split(",").map((s) => s.trim());
        const updatedTitle = title || project.title;
        const updatedDesc = desc || project.desc;

        const newCreatorRole = await determineCreatorRole(creatorUser, {
            title: updatedTitle,
            desc: updatedDesc,
            requiredSkills: skillsArray,
        });

        const updatedAiAnalysis = {
            ...(project.aiAnalysis ? project.aiAnalysis.toObject() : {}),
            ...(aiAnalysis || {}),
            creatorRole: newCreatorRole,
            analyzedAt: new Date(),
        };

        const updateData = {
            title: updatedTitle,
            desc: updatedDesc,
            requiredSkills: skillsArray,
            membersRequired: Number(membersRequired ?? memberRequired ?? project.membersRequired),
            aiAnalysis: updatedAiAnalysis,
        };

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            updateData,
            { new: true }
        );

        return res.status(200).json(updatedProject);

    } catch (err) {
        console.error("Update Project Error:", err);
        return res.status(500).json({
            error: "Server Error",
            e: err.message,
        });
    }
};

export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate("creator", "name");
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: "Server Error cannot find Projects", e: err.message });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("creator", "name bio id")
            .lean();

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const acceptedCount = await Application.countDocuments({
            project: req.params.id,
            status: "accepted",
        });

        const totalApplicants = await Application.countDocuments({
            project: req.params.id,
        });

        const responseData = {
            ...project,
            acceptedCount,
            totalApplicants,
            activeMembers: acceptedCount + 1,
        };

        res.json(responseData);
    } catch (err) {
        console.error("Get Project By ID Error:", err);
        res.status(500).json({
            error: "Server Error: Cannot Find any Project with id #" + req.params.id,
        });
    }
};

export const getMyCreatedProject = async (req, res) => {
    try {
        const projects = await Project.find({ creator: req.user.id });

        const projectsWithCount = await Promise.all(
            projects.map(async (project) => {
                const applicantCount = await Application.countDocuments({
                    project: project._id,
                });

                const acceptedCount = await Application.countDocuments({
                    project: project._id,
                    status: "accepted",
                });

                return {
                    ...project.toObject(),
                    id: project._id.toString(),
                    applicantCount,
                    acceptedCount,
                    activeMembers: acceptedCount + 1,
                };
            })
        );

        res.status(200).json(projectsWithCount);
    } catch (err) {
        res.status(500).json({ error: "Server Error", e: err.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: "Project Not Found" });
        if (project.creator.toString() != req.user.id) return res.status(403).json({ error: "Unauthorized Access" });
        await Application.deleteMany({ project: projectId });
        await Project.findByIdAndDelete(projectId);
        res.status(200).json({ message: "Project Deleted Successfully" });
    } catch (err) {
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
};

export const analyzeDraft = async (req, res) => {
  try {
    const { projectId, title, desc, requiredSkills, membersRequired } = req.body;

    if (!title && !desc) {
      return res.status(400).json({ error: "Please provide at least a title or description to analyze." });
    }

    const suggestions = await analyzeProjectDraft({ title, desc, requiredSkills, membersRequired });

    if (projectId) {
      await Project.findByIdAndUpdate(projectId, {
        aiAnalysis: {
          ...suggestions,
          analyzedAt: new Date(),
        },
      });
    }

    return res.status(200).json(suggestions);
  } catch (err) {
    console.error("Project Analysis Error:", err);
    return res.status(500).json({ error: "Failed to analyze project draft.", details: err.message });
  }
};

export const checkProjectFeasibility = async (req, res) => {
  try {
    const { title, description, desc, techStack, requiredSkills } = req.body;
    const projectDesc = desc || description;

    if (!projectDesc) {
      return res.status(400).json({ error: "Project description is required for feasibility check." });
    }

    const prompt = `
      You are an expert software architect and technical lead. 
      Analyze the following project idea:
      Title: ${title || 'Untitled Project'}
      Description: ${projectDesc}
      Target Tech Stack / Skills: ${techStack || requiredSkills || 'Not specified'}

      Provide a feasibility assessment in valid JSON format with the following exact keys:
      - compatibilityAnalysis: A brief evaluation of how well the tech stack fits the project idea.
      - difficultyScore: A number from 1 to 10 representing overall project difficulty.
      - architecturalBottlenecks: An array of strings highlighting potential technical bottlenecks or challenges.
      - taskBlueprint: An array of objects representing a task breakdown structure to get started, where each object has "taskName" and "description".
    `;

    // Resilient retry loop for 503 high-demand server spikes
    let retries = 3;
    let delay = 2000;
    let response;

    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        break; // Success, exit retry loop
      } catch (apiErr) {
        retries--;
        if (retries === 0) throw apiErr;
        console.warn(`Gemini high demand (503). Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    const result = JSON.parse(response.text);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error("Feasibility Check Error:", err);
    return res.status(503).json({ 
      error: "AI model is currently experiencing high demand. Please try again in a moment.", 
      details: err.message 
    });
  }
};

export const getSkillGapAnalysis = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const creatorUser = await User.findById(project.creator).select("name email skills bio");

    const acceptedApplications = await Application.find({
      project: projectId,
      status: "accepted",
    }).populate("applicant", "name email skills bio");

    const creatorRole = project.aiAnalysis?.creatorRole || "Project Lead";

    const teamMembersList = [
      {
        id: creatorUser._id.toString(),
        name: creatorUser.name,
        role: `${creatorRole} (Creator)`,
        skills: creatorUser.skills || [],
      },
      ...acceptedApplications.map((app) => ({
        id: app.applicant._id.toString(),
        name: app.applicant.name,
        role: app.assignedRole || "Team Member",
        skills: app.applicant.skills || [],
      })),
    ];

    const teamMembers = [
      creatorUser,
      ...acceptedApplications.map((app) => app.applicant),
    ];

    const analysis = await analyzeTeamSkillGap({ project, teamMembers });

    return res.status(200).json({
      projectTitle: project.title,
      teamSize: teamMembersList.length,
      members: teamMembersList,
      analysis,
    });
  } catch (err) {
    console.error("Skill Gap Analysis Error:", err);
    return res.status(500).json({ error: "Failed to analyze team skill gap.", details: err.message });
  }
};
