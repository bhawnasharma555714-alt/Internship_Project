import Application from "../Models/applicationModel.js";
import Project from "../Models/projectModel.js";
import User from "../Models/userModel.js";
import { generateAIMatch } from "../services/gemini.js";

// ==========================================
// 1. APPLY TO PROJECT
// ==========================================
export const applyProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { message } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: "Project not found!!" });

        // Phase 1 Guard: Block applications if recruitment is not active
        if (project.status !== "recruitment") {
            return res.status(400).json({ 
                error: `Applications are closed for this project. Current status: '${project.status}'.` 
            });
        }

        const userId = req.user.id || req.user._id;
        const existingApplication = await Application.findOne({
            applicant: userId,
            project: projectId,
        });

        if (existingApplication) {
            return res.status(400).json({ error: "Already applied for this project" });
        }

        const applicant = await User.findById(userId);
        if (!applicant) return res.status(404).json({ error: "User not found!!" });

        let aiMatchScore = null;
        let assignedRole = "Team Contributor";
        let strengths = [];
        let weaknesses = [];
        let aiFeedback = "";

        try {
            console.log("Reached apply controller with message:", message);
            const aiResult = await generateAIMatch(applicant, project, message);

            aiMatchScore = aiResult.score;
            assignedRole = aiResult.assignedRole || "Team Contributor";
            strengths = aiResult.strengths || [];
            weaknesses = aiResult.weaknesses || [];
            aiFeedback = aiResult.feedback || "";
        } catch (aiError) {
            console.error("Gemini Evaluation Error:", aiError.message);
        }

        const newApplication = await Application.create({
            applicant: userId,
            project: projectId,
            message: message || "",
            aiMatchScore,
            assignedRole,
            strengths,
            weaknesses,
            aiFeedback
        });

        return res.status(201).json(newApplication);

    } catch (err) {
        console.error("Apply Controller Error:", err);
        return res.status(500).json({
            error: "Server Error",
            e: err.message,
        });
    }
};

// ==========================================
// 2. ANALYZE APPLICATION
// ==========================================
export const analyzeApplication = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ error: "Application Not Found" });

        const applicant = await User.findById(application.applicant);
        const project = await Project.findById(application.project);
        if (!applicant || !project) return res.status(404).json({ error: "Application or Project Not Found" });

        try {
            const aiResult = await generateAIMatch(applicant, project, application.message);
            application.aiMatchScore = aiResult.score;
            application.strengths = aiResult.strengths;
            application.weaknesses = aiResult.weaknesses;
            application.aiFeedback = aiResult.feedback;
            await application.save();
        } catch (aiError) {
            console.error("Gemini Error:", aiError.message);
            return res.status(500).json({ error: "AI Analysis failed. Please try again later." });
        }

        const updatedApplication = await Application.findById(application._id)
            .populate("project")
            .populate("applicant");

        return res.status(200).json(updatedApplication);
    } catch (err) {
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
};

// ==========================================
// 3. GET PROJECT APPLICANTS
// ==========================================
export const getProjectApplicants = async (req, res) => {
    try {
        const projectId = req.params.id;
        console.log("Project ID:", projectId);
        const project = await Project.findById(projectId);

        const applicants = await Application.find({
            project: projectId
        }).populate("applicant", "name email bio skills location university jobProfile branch");

        res.status(200).json({ project, applicants });
    } catch (err) {
        res.status(500).json({ error: "Server Error", e: err.message });
    }
};

// ==========================================
// 4. GET MY APPLICATIONS
// ==========================================
export const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;

        const applications = await Application.find({
            applicant: userId
        }).populate("project", "title desc requiredSkills membersRequired creator status scope universityName");

        res.status(200).json(applications);
    } catch (err) {
        res.status(500).json({ error: "Server Error", e: err.message });
    }
};

// ==========================================
// 5. DELETE/WITHDRAW APPLICATION
// ==========================================
export const deleteApplication = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ error: "Application Not Found" });
        if (application.applicant.toString() !== req.user.id) return res.status(403).json({ error: "Unauthorized Access" });

        await Application.findByIdAndDelete(applicationId);
        res.status(200).json({ message: "Application Withdrawn Successfully" });
    } catch (err) {
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
};

// ==========================================
// 6. UPDATE APPLICATION STATUS (Accept/Reject with Auto-Lock)
// ==========================================
export const updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be 'accepted' or 'rejected'." });
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ error: "Application does not exist!" });
        }

        const project = await Project.findById(application.project);
        if (!project) {
            return res.status(404).json({ error: "Associated project does not exist!" });
        }

        // Authorization check: Only creator can update application status
        if (project.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        if (status === "accepted") {
            // Guard: Cannot accept applicants if project is already completed
            if (project.status === "completed") {
                return res.status(400).json({ error: "Cannot accept applicants for a completed project." });
            }

            const currentMembersCount = project.members?.length || 1;
            if (currentMembersCount >= project.membersRequired) {
                return res.status(400).json({ error: "Project has reached its member capacity!" });
            }

            // Sync project members array
            if (!project.members.includes(application.applicant)) {
                project.members.push(application.applicant);
            }

            // 🎯 AUTO-TRANSITION TO ACTIVE IF CAPACITY REACHED
            if (project.members.length >= project.membersRequired) {
                project.status = "active";
            }

            application.acceptedAt = new Date();
            await project.save();
        } else {
            application.acceptedAt = null;
        }

        application.status = status;
        await application.save();

        res.status(200).json({
            message: `Application ${status} successfully.`,
            projectStatus: project.status,
            activeMembersCount: project.members.length,
            membersRequired: project.membersRequired,
            application
        });
    } catch (err) {
        console.error("Update Application Status Error:", err);
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
};

// ==========================================
// 7. REMOVE COLLABORATOR (With Auto-Reopen)
// ==========================================
export const removeCollaborator = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ error: "Application not found." });

        const project = await Project.findById(application.project);
        if (!project) return res.status(404).json({ error: "Associated project not found." });

        if (project.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to perform this action." });
        }

        if (application.status !== "accepted") {
            return res.status(400).json({ error: "Only accepted collaborators can be removed" });
        }

        // Remove applicant from project members array
        project.members = project.members.filter(
            (memberId) => memberId.toString() !== application.applicant.toString()
        );

        // 🎯 AUTO-REOPEN RECRUITMENT IF PROJECT WAS ACTIVE AND IS NO LONGER FULL
        if (project.status === "active" && project.members.length < project.membersRequired) {
            project.status = "recruitment";
        }

        await project.save();

        application.status = "pending";
        application.acceptedAt = null;
        await application.save();

        return res.status(200).json({
            message: "Collaborator removed successfully.",
            projectStatus: project.status,
            activeMembersCount: project.members.length,
            application,
        });
    } catch (err) {
        console.error("Remove Collaborator Error:", err);
        return res.status(500).json({ error: "Server Error", details: err.message });
    }
};