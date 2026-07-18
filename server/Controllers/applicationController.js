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
        }).populate("project", "title desc requiredSkills memberRequired");
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
        console.log("Project ID:", projectId);
        const project = await Project.findById(projectId);
        const applicants = await Application.find({
            project: projectId
        }).populate("applicant", "name bio skills")
        console.log("Applicants:", applicants);
        res.status(200).json({project,applicants});
    }catch(err){    
         res.status(500).json({error: "Server Error", e:err.message});
    }
}

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

            if (acceptedCount >= application.project.membersRequired) {
                return res.status(400).json({ error: "Project has reached its member capacity!" });
            }
        }

        application.status = status;
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