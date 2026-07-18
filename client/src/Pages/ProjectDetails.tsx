import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import type { project } from "../types/project";
function ProjectDetails(){
    const { id } = useParams();
    const[project,setProject] = useState<project | null>(null);
    const[error,setError] = useState("");
    useEffect(()=>{
        getProject();
    },[])

    const getProject = async() => {
        try{
        const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        }catch(err){
            setError("Failed to fetch project");
        }
    }
    const handleApply = async() => {
        try{
            await api.post(`/applications/${id}/apply`, {
                projectId : id  
            })
            alert("Application submitted");
        }catch(err: any){
            alert(err.response?.data?.error ||"Failed to apply");
        }

    }
    if(!project) return <p>Loading...</p>
    return(
        <div>
            <h1>Projects</h1>
            {error && <p>{error}</p>}
            <h2>{project.title}</h2>
            <p>{project.desc}</p>
            <p>Skills : {project.requiredSkills.join(", ")}</p>
            <p>Members Required : {project.memberRequired}</p> 
            <button onClick={handleApply}>Apply</button>
        </div>
    );
}

export default ProjectDetails;