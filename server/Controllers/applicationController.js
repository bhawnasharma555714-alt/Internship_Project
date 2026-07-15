import Application from "../Models/applicationModel.js";
import Project from "../Models/projectModel.js";

export const applyProject = async(req,res) => {
    console.log("Applying for a Project...")
    try{
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        if(!project){
            return res.status(404).json({error:"Project not found!!"});
        }
        const userId = req.user.id;
        const existingApplication = await Application.findOne({
            applicant: userId,
            project: projectId
        });
        if(existingApplication){
            return res.status(400).json({
                error:"Already applied for this project"
            });
        }
        const newApplication = await Application.create({
            applicant:userId,
            project:projectId
        });
        console.log("Applied for Project");
        res.status(201).json(newApplication);

    }catch(err){
         res.status(500).json({error: "Server Error", e:err.message});
    }
}

export const getMyApplications = async(req,res) => {
    console.log("Fecthing your Applications")
    try{
        const userId = req.user.id;
        const  applications = await Application.find({
            applicant : userId
        }).populate("project", "title desc skillsReq memberReq");
        if(applications.length === 0){
            return res.status(404).json({error:"No Applications found"});
        }
        res.status(200).json(applications);
    }catch(err){
         res.status(500).json({error: "Server Error", e:err.message});
    }
}

export const getProjectApplicants = async(req,res) => {
    console.log("Fetching Project Applicants");
    try{
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        const applicants = await Application.find({
            project: projectId,
            status: "pending"
        }).populate("applicant", "name bio skills")
        res.status(200).json({project,applicants});
    }catch(err){    
         res.status(500).json({error: "Server Error", e:err.message});
    }
}