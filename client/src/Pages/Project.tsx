import { useEffect, useState } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Users } from "lucide-react";
import Layout from "../Components/Layout";
import Loader from "../Components/Loader";
import Error from "../Components/Error";
import { useAuth } from "../Context/AuthContext";
function Project(){
    const {user} = useAuth();
    const [projects, setProjects] = useState<project[]>([]);
    const [error,setError] = useState("");
    const [search,setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        getProjects()
    },[]);
    const getProjects = async() => {
        try{
            const res = await api.get("/projects");
            console.log(res.data);
            setProjects(res.data);
        }catch(err){
            console.log(err)
            setError("Failed to load Projects!");
        }finally{
            setLoading(false);
        }
    };

    const displayedProjects = (search.trim() === "" ) ? projects : projects.filter((project)=>
        project.title.toLowerCase().includes(search.toLowerCase()) || 
        project.desc.toLowerCase().includes(search.toLowerCase()) || 
        project.requiredSkills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
    );
    if(loading) return(<Loader/>) 
    if(error) return(<Error className="h-60 w-60 md:h-80 md:w-80" error={error}/>)
    return(
        <Layout>
            <h1 className="text-4xl md:text-5xl font-medium text-white text-center">Explore Projects</h1>
 
            <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto text-center">Find exciting student projects and start collaborating.</p>
            <div className="flex justify-center mt-8">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 w-5 h-5"/>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
                </div>
            </div>

            <p className="text-white text-center p-4">{displayedProjects.length} project{displayedProjects.length !== 1 && "s"} found</p>

            {displayedProjects.length === 0 ? (
                <div className="text-center">
                    <h2 className="text-slate-400 p-4 text-3xl">No projects found</h2>
                    <p className="text-slate-500 p-2 text-xl">Try searching with different keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {displayedProjects.map((project) => (
                        
                        <div key={project.id} className="bg-slate-800 rounded-2xl shadow-lg p-6 hover:-translate-y-2 hover:shadow-xl hover:border-sky-700 transition-all duration-300 border border-slate-700">
                            <div className="flex-col">
                                <h2 className="text-2xl font-semibold text-white truncate">{project.title}</h2>
                                {(project.creator.id === user?.id) && (<div className="inline-flex bg-green-500/20 text-green-400 mt-3 px-3 py-2 rounded-lg font-semibold">✓ Your Project</div>)}
                            </div>
                            <p className="text-slate-300 mt-3 line-clamp-3">{project.desc}</p>
                            <div className="flex flex-wrap gap-2 mt-5 p-4 justify-center">
                                {project.requiredSkills.slice(0, 3).map((skill,index) => (
                                    <span key={`${skill}-${index}`} className="bg-sky-100 text-sky-900 px-3 py-1 rounded-full text-sm whitespace-nowrap">{skill}</span>
                                ))}
                                {project.requiredSkills.length > 3 && (
                                    <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300">+{project.requiredSkills.length - 3}</span>
                                )}
                            </div>

                            <div className="mt-5 flex justify-between items-center">
                                <div className="flex items-center text-slate-400">
                                    <Users size={20} className="text-sky-500" />
                                    <span className="pl-2">{project.membersRequired} Members</span>
                                </div>

                                <Link to={`/projects/${project.id}`} className="text-sky-500 font-medium hover:text-sky-400">View Details →</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
export default Project;