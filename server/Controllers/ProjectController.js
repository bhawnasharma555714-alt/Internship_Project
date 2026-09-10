import Project from "../Models/projectModel.js";
import Application from "../Models/applicationModel.js";

export const createProject = async(req,res) => {
    try{
        const project = req.body;
        if(!project.desc || !project.title){
            return res.status(400).json({error:"Title and Desc are required"});
        }
        const userId = req.user.id;
        const newProject = await Project.create({
            creator:userId,
            title:project.title,
            desc:project.desc,
        })
        res.status(201).json(newProject);
    }catch(err){
         res.status(500).json({error: "Server Error", e:err.message});
    }
}

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

export const updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found!" });
        }

        // Check ownership
        if (project.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to update this project." });
        }
        // Update project
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedProject);

    } catch (err) {
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
};

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
