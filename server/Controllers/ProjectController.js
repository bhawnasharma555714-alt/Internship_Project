import Project from "../Models/projectModel.js";
import Application from "../Models/applicationModel.js";
import User from "../Models/userModel.js"
import { analyzeProjectDraft } from "../utils/projectAnalyzer.js";
import { analyzeTeamSkillGap } from "../utils/skillGapAnalyzer.js";
import { determineCreatorRole } from "../utils/projectAnalyzer.js";

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

        // Determine creator's specific role based on their profile + final project content
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
                creatorRole, // Saved in database
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

        // Find existing project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found!" });
        }

        // Check ownership
        if (project.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to update this project." });
        }

        const { title, desc, requiredSkills, skillsRequired, membersRequired, memberRequired, aiAnalysis } = req.body;

        // Fetch creator details to re-evaluate their role based on updated project details
        const creatorUser = await User.findById(req.user.id);

        const rawSkills = requiredSkills || skillsRequired || project.requiredSkills;
        const skillsArray = Array.isArray(rawSkills) ? rawSkills : rawSkills.split(",").map((s) => s.trim());
        const updatedTitle = title || project.title;
        const updatedDesc = desc || project.desc;

        // 🎯 Re-evaluate Creator Role with updated project details & creator profile
        const newCreatorRole = await determineCreatorRole(creatorUser, {
            title: updatedTitle,
            desc: updatedDesc,
            requiredSkills: skillsArray,
        });

        // Merge existing aiAnalysis with new suggestions and updated creatorRole
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

//http://localhost:3000/api/projects
export const getAllProjects = async(req,res) => {
    try{
        const projects = await Project.find().populate("creator", "name");
        res.json(projects);
    }catch(err){
        res.status(500).json({error:"Server Error cannot find Projects", e:err.message});
    }
}

//http://localhost:3000/api/projects/:id
export const getProjectById = async(req,res) => {
    try{
       const project = await Project.findById(req.params.id).populate("creator","name bio id");
       if(!project){
        return res.status(404).json({error:"Project not found"});
       }
       res.json(project);
    }catch(err){
        res.status(500).json({error:"Server Error : Cannot Find any Project with id #"+req.params.id});
    }
}

export const getMyCreatedProject = async(req,res) => {
    try{
        const projects = await Project.find({ creator: req.user.id });
        const projectsWithCount = await Promise.all(
            projects.map(async (project) => {
                const applicantCount = await Application.countDocuments({
                    project: project._id,
                });

                return {
                    ...project.toObject(),
                    id: project._id.toString(),
                    applicantCount,
                };
            })
        );
        res.status(200).json(projectsWithCount);
    }catch(err){
        res.status(500).json({error:"Server Error", e:err.message});
    }
}

export const deleteProject = async(req,res) => {
    try{
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        if(!project) return res.status(404).json({error:"Project Not Found"});
        if(project.creator.toString() != req.user.id) return res.status(403).json({error:"Unauthorized Access"});
        await Application.deleteMany({project:projectId});
        await Project.findByIdAndDelete(projectId);
        res.status(200).json({message:"Project Deleted Successfully"});
    }catch (err) {
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
}


export const analyzeDraft = async (req, res) => {
  try {
    const { projectId, title, desc, requiredSkills, membersRequired } = req.body;

    if (!title && !desc) {
      return res.status(400).json({ error: "Please provide at least a title or description to analyze." });
    }

    const suggestions = await analyzeProjectDraft({ title, desc, requiredSkills, membersRequired });

    // If an existing projectId is provided, persist analysis to DB
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

    // Fetch creator details
    const creatorUser = await User.findById(project.creator).select("name email skills bio");

    // Fetch accepted applications with applicant details
    const acceptedApplications = await Application.find({
      project: projectId,
      status: "accepted",
    }).populate("applicant", "name email skills bio");

    // Resolve creator's matched role from persisted AI analysis
    const creatorRole = project.aiAnalysis?.creatorRole || "Project Lead";

    // Format member list with assigned roles
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

    // Format data for AI analysis
    const teamMembers = [
      creatorUser,
      ...acceptedApplications.map((app) => app.applicant),
    ];

    const analysis = await analyzeTeamSkillGap({ project, teamMembers });

    return res.status(200).json({
      projectTitle: project.title,
      teamSize: teamMembersList.length,
      members: teamMembersList, // Array of members with assigned roles
      analysis,
    });
  } catch (err) {
    console.error("Skill Gap Analysis Error:", err);
    return res.status(500).json({ error: "Failed to analyze team skill gap.", details: err.message });
  }
};