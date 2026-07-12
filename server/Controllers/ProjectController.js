import Project from "../Models/projectModel.js";

export const createProject = async(req,res) => {
    console.log("Creating a Project...")
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
        console.log("Project Posted");
        res.status(201).json(newProject);
    }catch(err){
         res.status(500).json({error: "Server Error", e:err.message});
    }
}

//http://localhost:3000/api/projects
export const getAllProjects = async(req,res) => {
    console.log('Fetching All Projects');
    try{
        const projects = await Project.find().populate("creator", "name");
        res.json(projects);
    }catch(err){
        res.status(500).json({error:"Server Error cannot find Projects", e:err.message});
    }
}

//http://localhost:3000/api/projects/:id
export const getProjectById = async(req,res) => {
    console.log("Fetching Project by Id");
    try{
       const project = await Project.findById(req.params.id).populate("creator","name bio");
       if(!project){
        return res.status(404).json({error:"Project not found"});
       }
       res.json(project);
    }catch(err){
        res.status(500).json({error:"Server Error : Cannot Find any Project with id #"+req.params.id});
    }
}

export const getMyCreatedProject = async(req,res) => {
    console.log('Fetching my own projects');
    try{
        const userId = req.user.id;
        const projects = await Project.find({
            creator : userId
        });
        res.status(200).json(projects);
    }catch(err){
        res.status(500).json({error:"Server Error", e:err.message});
    }
}