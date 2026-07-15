import { useEffect, useState } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import { useNavigate } from "react-router-dom";
function Project(){
    const [projects, setProjects] = useState<project[]>([]);
    const [error,setError] = useState("");
    useEffect(()=>{
        getProjects()
    },[]);
    const navigate = useNavigate();
    const getProjects = async() => {
        try{
            const res = await api.get("/projects");
            setProjects(res.data);
        }catch(err){
            setError("Failed to load Projects");
        }
    };
    return(
        <div>
            <h1>Projects</h1>
            {error && <p>{error}</p>}
            {projects.map((project)=>(
                <div key={project.id}>
                    <h2>{project.title}</h2>
                    <p>{project.desc}</p>
                    <p>Skills : {project.requiredSkills.join(", ")}</p>
                    <p>Members Required : {project.memberRequired}</p>
                    <button onClick={()=> navigate(`/projects/${project.id}`)}>View Details</button>
                </div>
            ))}
        </div>
    );
}

export default Project;