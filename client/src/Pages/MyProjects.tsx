import { useState, useEffect } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import { useNavigate } from "react-router-dom";
import Layout from "../Components/Layout";
import Loader from "../Components/Loader";
import Error from "../Components/Error";
import { Users,Search,UserRoundPlus } from "lucide-react";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";


function MyProjects(){
    const [projects,setProjects] = useState<project[]>([]);
    const [error,setError] = useState("");
    const [loading,setLoading] = useState(true);
    const [search,setSearch] = useState("");
    const [expanded,setExpanded] = useState(false);
    const navigate = useNavigate();
    useEffect(()=>{
        getMyProjects();
    },[])
    const getMyProjects = async() => {
        try{
            const res = await api.get("/projects/my");
            console.log(res.data);
            setProjects(res.data);
            console.log(projects);
        }catch(err:unknown){
            setError("Failed to fetch your Projects");
        }finally{
            setLoading(false);
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
    const displayedProjects = (search.trim() === "" ) ? projects : projects.filter((project)=>
        project.title.toLowerCase().includes(search.toLowerCase()) || 
        project.desc.toLowerCase().includes(search.toLowerCase()) || 
        project.requiredSkills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
    );
    if(loading) return <Loader/>
    if(error) return <Error className="h-80 w-80" error={error}/>
    return(
        <Layout>
            <h1 className="text-4xl md:text-5xl font-medium text-white text-center">My Projects</h1>
            <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto text-center">Browse your projects</p>
            <div className="flex justify-center mt-8">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 w-5 h-5"/>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
                </div>
            </div>
            <p className="text-white text-center p-4">{displayedProjects.length} project{displayedProjects.length !== 1 && "s"} found</p>
            {displayedProjects.length === 0 ? (
                <div className="text-center">
                    <h2 className="text-slate-400 p-4 text-3xl">
                        No projects found
                    </h2>
                    <p className="text-slate-500 p-2 text-xl">
                        Try searching with different keywords.
                    </p>
                </div>
            ) : (displayedProjects.map((project)=>(
                <div key={project.id} className="max-w-3xl mx-auto border-4 border-slate-700 mt-10 p-10 text-left rounded-2xl hover:border-slate-600 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)]">
                    <h2 className="text-4xl font-bold text-white py-2">{project.title}</h2>
                    <div className="max-w-3xl leading-8 text-slate-300">
                        <p className={expanded ? "" : "line-clamp-3"}>{project.desc}</p>
                        {project.desc.length > 180 && (<button onClick={() => setExpanded(!expanded)} className="mt-2 text-sky-500 hover:text-sky-400 text-sm font-medium">
                            {expanded ? "Read Less" : "Read More"}
                        </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1">
                        {project.requiredSkills.map((skill,index) => (
                            <span key={`${skill}-${index}`} className="bg-sky-100 text-sky-900 px-5 py-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:cursor-pointer">{skill}</span>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center">
                        <Users className="text-sky-500 w-7 h-7" />
                        <span className="pl-2 text-slate-400 font-medium">{project.membersRequired} Members</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <UserRoundPlus className="w-5 h-5 text-emerald-500" />
                        <span className="text-slate-400">   
                            {project.applicantCount} Applicants
                        </span>
                    </div>
                    <div className="mt-1 flex flex-col justify-between items-center md:flex-row lg:flex-row">
                        <button className="bg-sky-700 text-white font-medium px-8 py-2 mt-6 rounded-lg hover:bg-sky-600 transition-colors" onClick={()=> navigate(`/applications/${project.id}/applicants`)}>View Applicants</button>
                        <div className="flex items-center gap-3">
                            <button className="bg-green-700 text-white font-medium px-8 py-2 mt-6 rounded-lg hover:bg-green-600 transition-colors" onClick={()=>navigate(`/project/${project.id}/edit`)}>Edit Project</button>
                            <button className="text-white font-medium px-8 py-2 mt-6 rounded-lg border-2 border-text-slate-600 hover:bg-red-600 hover:border-red-500 transition-colors" onClick={() => deleteProject(project.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            )))}
        </Layout>
    );
}

export default MyProjects;