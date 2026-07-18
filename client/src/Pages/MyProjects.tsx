import { useState, useEffect } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import { useNavigate } from "react-router-dom";


function MyProjects(){
    const [projects,setProjects] = useState<project[]>([]);
    const [error,setError] = useState("");
    const navigate = useNavigate();
    useEffect(()=>{
        getMyProjects();
    },[])
    const getMyProjects = async() => {
        try{
            const res = await api.get("/projects/my");
            setProjects(res.data);
        }catch(err:unknown){
            setError("Failed to fetch your Projects");
        }
    }
    const deleteProject = async(id:string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if(!confirmDelete) return;
        try{
            await api.delete(`projects/${id}`);
            setProjects((prev)=> prev.filter((project) => project.id !== id));
        }catch(err){
            alert('Failed to delete project');
        }

    }
    
    return(
        <div>
            <h1>My Projects</h1>
            {error && <p>{error}</p>}
            {projects.map((project)=>(
                <div key={project.id}>
                    <h2>{project.title}</h2>
                    <p>{project.desc}</p>
                    <p>Skills : {project.requiredSkills.join(", ")}</p>
                    <p>Members Required : {project.membersRequired}</p>
                    <button onClick={()=> navigate(`/applications/${project.id}/applicants`)}>View Applicants</button>
                    <button onClick={()=>navigate(`/project/${project.id}/edit`)}>Edit Project</button>
                    <button onClick={() => deleteProject(project.id)}>Delete</button>
                </div>
            ))}

        </div>
    );
}

export default MyProjects;