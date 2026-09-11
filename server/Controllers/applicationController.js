import Application from "../Models/applicationModel.js";
import Project from "../Models/projectModel.js";
import User from "../Models/userModel.js";
import { generateAIMatch } from "../services/gemini.js";

export const applyProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { message } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: "Project not found!!" });

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
export const analyzeApplication = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ error: "Application Not Found" });

        const applicant = await User.findById(application.applicant);
        const project = await Project.findById(application.project);
        if (!applicant || !project) return res.status(404).json({ error: "Application or Project Not Found" });

        try {
            // FIX: Pass the stored cover note message into generateAIMatch
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

export const getProjectApplicants = async (req, res) => {
    try {
        const projectId = req.params.id;
        console.log("Project ID:", projectId);
        const project = await Project.findById(projectId);

        // Application.find automatically returns all fields in the Application model 
        // (including 'message', 'aiMatchScore', 'strengths', 'weaknesses', 'aiFeedback', 'status').
        // We ensure 'applicant' populates location, university, jobProfile, and branch alongside standard fields.
        const applicants = await Application.find({
            project: projectId
        }).populate("applicant", "name email bio skills location university jobProfile branch");

        res.status(200).json({ project, applicants });
    } catch (err) {
        res.status(500).json({ error: "Server Error", e: err.message });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;

        // Returns all Application fields (including 'message', 'status', 'aiMatchScore', etc.)
        // and populates project details.
        const applications = await Application.find({
            applicant: userId
        }).populate("project", "title desc requiredSkills membersRequired creator");

        res.status(200).json(applications);
    } catch (err) {
        res.status(500).json({ error: "Server Error", e: err.message });
    }
};
export const deleteApplication = async(req,res) => {
    try{
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId);
        if(!application) return res.status(404).json({error:"Application Not Found"});
        if(application.applicant.toString() != req.user.id) return res.status(403).json({error:"Unauthorized Access"});
        await Application.findByIdAndDelete(applicationId);
        res.status(200).json({message:"Application Withdrawn Successfully"});
    }catch (err) {
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
}
export const updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const application = await Application.findById(applicationId).populate("project");

        if (!application) {
            return res.status(404).json({ error: "Application does not exist!" });
        }

        if (application.project.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        if (status === "accepted") {
            const acceptedCount = await Application.countDocuments({
                project: application.project._id,
                status: "accepted"
            });
            console.log("ACCEPTED COUNT:", acceptedCount);
            console.log("MEMBERS REQUIRED:", application.project.membersRequired);  
            if (acceptedCount >= application.project.membersRequired) {
                return res.status(400).json({ error: "Project has reached its member capacity!" });
            }
        }
        application.status = status;
        if (status === "accepted") {
            application.acceptedAt = new Date();
        } else {
            application.acceptedAt = null;
        }
        await application.save();

        res.status(200).json({
            message: `Application ${status} successfully.`,
            application
        });
    } catch (err) {
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
};

export const removeCollaborator = async(req,res) => {
    try{
        const application =  await Application.findById(req.params.id).populate("project");
        if(!application) return res.status(404).json({error : "Application not found."})
        if(application.project.creator.toString() !== req.user.id){
            return res.status(403).json({error : "You are not authorized to perform this action."});
        }
        if(application.status !== "accepted"){
            return res.status(400).json({error : "Only accepted collaborators can be removed"});
        }
        application.status = "pending";
        application.acceptedAt = null;
        await application.save();
        return res.status(200).json({
            message:"Collaborator removed successfully.",
            application,
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"Server Error"});
    }
};