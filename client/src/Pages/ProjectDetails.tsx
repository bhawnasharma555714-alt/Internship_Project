import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import Layout from "../Components/Layout";
import { ArrowLeft,Users,FileText, Brain, Palette} from "lucide-react";
import Error from "../Components/Error";
import Loader from "../Components/Loader";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";
import { useAuth } from "../Context/AuthContext";

function ProjectDetails(){
    const { id } = useParams();
    const { user } = useAuth();
    const[project,setProject] = useState<project | null>(null);
    const[error,setError] = useState("");
    const[loading, setLoading] = useState(true);
    const [isApplying,setIsApplying] = useState(false);
    const[expanded,setExpanded] = useState(false);
    const navigate = useNavigate();
    const isOwner = project?.creator.id === user?.id;
    console.log(isOwner);
    useEffect(()=>{
        getProject();
    },[])

    const getProject = async() => {
        try{
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        }catch(err){
            setError("Project Not Found");
        }finally{
            setLoading(false);
        }
    }
    const handleApply = async() => {
        setIsApplying(true);
        try{
            await api.post(`/applications/${id}/apply`, {
                projectId : id  
            })
            toast.custom(()=>(
                <CustomToast type="success" title="Application Submitted" message="Your Application has been sent successfully."/>
            ),{duration:1000})
        }catch(err: any){
            toast.custom(()=>(
                <CustomToast type="error" title="Application Failed" message={err.response?.data?.error || "Failed to submit Application"}/>
            ),{duration:1500})
        }finally{
            setIsApplying(false);
        }
    }
    if(loading) return <Loader/>;
    if(error) return <Error className="h-60 w-60 md:h-80 md:w-80" error={error}/>
    return(
        <Layout>
            <div className="flex items-center">
                <ArrowLeft className="text-slate-400 h-8 w-8 font-bold hover:text-slate-300"/>
                <button className="pl-2 font-semibold text-slate-400 text-2xl hover:text-slate-300" onClick={()=> navigate(`/projects`)}>Back to Projects</button>
            </div>
                {project && <div className="max-w-2xl mx-auto border-4 border-slate-700 mt-10 p-10 text-left rounded-2xl hover:border-slate-600 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)]">
                    <div className="flex-col">
                        <h2 className="text-4xl font-bold text-white">{project.title}</h2>
                        {isOwner && (<div className="inline-flex bg-green-500/20 text-green-400 mt-3 px-4 py-2 rounded-lg font-semibold">✓ Your Project</div>)}
                    </div>
                    <section className="text-slate-300 mt-3 line-clamp-3 py-6 flex flex-col gap-6">
                        <div className="max-w-3xl leading-8">
                            <div className="flex flex-row">
                                <FileText className="w-7 h-7 mt-2 text-sky-500"/>
                                <p className="text-slate-400 font-semibold text-xl pr-4 pl-4 py-2">DESCRIPTION</p>
                            </div> 
                            <p className={expanded ? "" : "line-clamp-3"}>{project.desc}</p>
                            {project.desc.length > 180 && (<button onClick={() => setExpanded(!expanded)} className="mt-2 text-sky-500 hover:text-sky-400 text-sm font-medium">
                                {expanded ? "Read Less" : "Read More"}
                            </button>
                            )}
                        </div>
                        <div>
                            <div className="flex flex-row">
                                <Palette className="w-7 h-7 mt-2 text-sky-500"/>
                                <p className="text-slate-400 font-semibold text-xl pr-4 pl-4 py-2">CREATED BY</p>
                            </div>
                            <p>{project.creator.name.toString()}</p>
                        </div>
                    </section>

                    <section className="flex flex-col mt-2">
                        <div className="flex flex-row">
                            <Brain className="w-7 h-7 mt-2 text-sky-500"/>
                            <p className="text-xl text-slate-400 py-2 pl-4 font-semibold">Required Skills</p>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1">
                            {project.requiredSkills.map((skill,index) => (
                                <span key={`${skill}-${index}`} className="bg-sky-100 text-sky-900 px-5 py-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:cursor-pointer">{skill}</span>
                            ))}
                        </div>
                    </section>
                    
                    <div className="mt-6 flex justify-between items-center">
                        <div className="mt-6 flex items-center">
                            <Users className="text-sky-500 w-7 h-7" />
                            <span className="pl-2 text-slate-400 font-medium">{project.membersRequired} Members</span>
                        </div>
                        {isOwner? (<button className="bg-sky-700 text-white font-medium px-8 py-3 mt-6 rounded-lg hover:bg-sky-600 transition-colors" onClick={()=> navigate(`/applications/${project.id}/applicants`)}>View Applicants</button>) :(<button disabled={isApplying} className="bg-sky-700 text-white font-medium px-8 py-2 mt-6 rounded-lg hover:bg-sky-600 transition-colors" onClick={handleApply}>{isApplying ? "Applying...":"Apply"}</button>)}
                    </div>
                </div>}
        </Layout>
    );
}

export default ProjectDetails;