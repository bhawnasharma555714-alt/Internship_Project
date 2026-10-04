import Project from "../Models/projectModel.js";
import Application from "../Models/applicationModel.js";
import User from "../Models/userModel.js";
import { analyzeProjectDraft, determineCreatorRole } from "../utils/projectAnalyzer.js";
import { analyzeTeamSkillGap } from "../utils/skillGapAnalyzer.js";

// POST /api/projects
export const createProject = async (req, res) => {
    try {
        const { 
            title, 
            desc, 
            requiredSkills, 
            skillsRequired, 
            membersRequired, 
            memberRequired, 
            scope, 
            universityName, 
            aiAnalysis 
        } = req.body;

        if (!title || !desc) {
            return res.status(400).json({ error: "Title and Desc are required" });
        }

        const userId = req.user.id;
        const creatorUser = await User.findById(userId);

        if (!creatorUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const skills = requiredSkills || skillsRequired || [];
        const members = membersRequired ?? memberRequired ?? 1;
        const skillsArray = Array.isArray(skills) ? skills : skills.split(",").map((s) => s.trim());

        // Derive universityName from user profile if not directly provided
        const projectUniversity = universityName || creatorUser.university || "Unknown University";

        // Determine creator's specific role based on profile + project details
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
            members: [userId], // Creator is the first active member
            scope: scope || "campus",
            universityName: projectUniversity,
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

// GET /api/projects?scope=campus | global
export const getAllProjects = async (req, res) => {
    try {
        const { scope, status } = req.query;
        let query = {};

        // Filter by project lifecycle status if provided (e.g., status=recruitment)
        if (status) {
            query.status = status;
        }

        // Scope Query Logic
        if (scope === "campus") {
            // Require logged-in user to identify university
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: "Authentication required for campus feed" });
            }
            const user = await User.findById(req.user.id);
            if (!user || !user.university) {
                return res.status(400).json({ error: "User profile has no associated university" });
            }
            query.scope = "campus";
            query.universityName = user.university;
        } else if (scope === "global") {
            query.scope = "global";
        }

        const projects = await Project.find(query)
            .populate("creator", "name university")
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: "Server Error cannot find Projects", e: err.message });
    }
};

// GET /api/projects/:id
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("creator", "name bio university")
            .populate("members", "name email skills")
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
            activeMembers: project.members?.length || acceptedCount + 1,
        };

        res.json(responseData);
    } catch (err) {
        console.error("Get Project By ID Error:", err);
        res.status(500).json({
            error: "Server Error: Cannot Find any Project with id #" + req.params.id,
        });
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

        const { title, desc, requiredSkills, skillsRequired, membersRequired, memberRequired, scope, universityName, aiAnalysis } = req.body;
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
            scope: scope || project.scope,
            universityName: universityName || project.universityName,
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
                    activeMembers: project.members?.length || acceptedCount + 1,
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
        if (project.creator.toString() !== req.user.id) return res.status(403).json({ error: "Unauthorized Access" });

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

// PATCH /api/projects/:id/status
export const updateProjectStatus = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { status: newStatus } = req.body;
        const userId = req.user.id;

        const validStatuses = ["recruitment", "active", "completed"];
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({ 
                error: `Invalid status. Allowed values: ${validStatuses.join(", ")}` 
            });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Rule 1: Authorization - Only the creator can change project status
        if (project.creator.toString() !== userId) {
            return res.status(403).json({ 
                error: "Forbidden: Only the project creator can change project lifecycle status." 
            });
        }

        const currentStatus = project.status;
        const currentMemberCount = project.members?.length || 1;

        // Rule 2: Terminal State Guard - Completed projects are permanently locked
        if (currentStatus === "completed") {
            return res.status(400).json({
                error: "Lifecycle Guard: This project is marked as 'completed' and cannot be reopened."
            });
        }

        // Rule 3: Capacity Guard - Prevent opening recruitment if the team is already full
        if (newStatus === "recruitment" && currentMemberCount >= project.membersRequired) {
            return res.status(400).json({
                error: `Capacity Guard Triggered: Cannot open recruitment because team capacity is full (${currentMemberCount}/${project.membersRequired} members).`
            });
        }

        // Apply status update
        project.status = newStatus;
        await project.save();

        return res.status(200).json({
            message: `Project status successfully updated from '${currentStatus}' to '${newStatus}'`,
            project
        });
    } catch (err) {
        console.error("Update Project Status Error:", err);
        return res.status(500).json({ error: "Server Error", details: err.message });
    }
};