import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import HeroVideo from "../assets/scrumBoard.webm";
import {Users,FolderOpen,Sparkles} from "lucide-react";
import { useEffect, useState } from 'react';
import type{ project } from '../types/project';
import api from '../services/api';
function Home(){
    const {user} = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,setError] = useState("");
    useEffect(()=>{
        getProjects();
    },[]);
    const getProjects = async() =>{
        try{
            const res = await api.get("/projects");
            setProjects(res.data.slice(0,3));
        }catch(err){
            setError("Failed to load projects");
        }finally{
            setLoading(false);
        }
    }
    return(
        <div className="min-h-[calc(100vh-80px)] bg-slate-900">
            <div className="max-w-6xl mx-auto px-6 py-14 text-center">
                <div className="grid md:grid-cols-2 items-center gap-12">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">Build Projects <span className="text-sky-600">Together</span></h1>
                        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">Discover exciting student projects, connect with teammates,and build real-world experience.</p>
                        {!user && <Link to="/login"><div className="mt-10 font-medium flex justify-center gap-4"><button className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors">Login/Signup</button></div></Link>}
                        {user && <div className="mt-10 flex justify-center gap-4">
                            <button className="bg-sky-800 font-medium text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors" onClick={()=>navigate('/projects')}>See Projects</button>
                            <button className="bg-sky-800 font-medium text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors" onClick={()=>navigate('/create-project')}>Upload your Project</button>
                        </div>
                    }
                    </div>
                    <div className="flex justify-center">
                        <video autoPlay loop muted playsInline className="w-full max-w-xl">
                        <source src={HeroVideo} type="video/webm" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
                <section className="max-w-7xl mx-auto px-6 py-15">
                    <h2 className="text-4xl font-bold text-center text-white">Why CollabConnect?</h2>
                    <p className="text-center text-slate-400 mt-4 max-w-2xl mx-auto">Everything you need to find teammates, collaborate on projects, and build an impressive portfolio.</p>
                </section>
                <div className="grid md:grid-cols-3 gap-8 mt-0">
                    <div className="bg-slate-800 rounded-2xl p-8 shadow hover:shadow-xl text-center flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:border-sky-700 transition-all duration-300 border border-slate-700">
                        <Users className="w-12 h-12 text-sky-500" />
                        <h3 className="text-xl font-semibold mt-5 text-white">Find Teammates</h3>
                        <p className="text-slate-400 mt-3">Connect with students who have the skills and passion to bring ideas to life.</p>
                    </div>
                    <div className="bg-slate-800 rounded-2xl p-8 shadow hover:shadow-xl text-center flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:border-sky-700 transition-all duration-300 border border-slate-700">
                        <FolderOpen className="w-12 h-12 text-sky-500" />
                        <h3 className="text-xl font-semibold mt-5 text-white">Discover Projects</h3>
                        <p className="text-slate-400 mt-3">Browse innovative student projects and join the ones that excite you.</p>
                    </div>
                    <div className="bg-slate-800 rounded-2xl p-8 shadow hover:shadow-xl text-center flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:border-sky-700 transition-all duration-300 border border-slate-700">
                        <Sparkles className="w-12 h-12 text-sky-500" />
                        <h3 className="text-xl font-semibold mt-5 text-white">AI Matching</h3>
                        <p className="text-slate-400 mt-3">Receive AI-powered recommendations and personalized project feedback.</p>
                    </div>
                </div>
                <section className="bg-slate-900 py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center text-white">Featured Projects</h2>
                        <p className="text-center text-slate-400 mt-4 max-w-2xl mx-auto">Explore exciting projects created by students and start collaborating today.</p>
                        {loading && (<p className="text-center mt-10">Loading...</p>)}
                        {error && (<p className="text-center text-red-500 mt-10">{error}</p>)}

                        {!loading && !error && (
                            <div className="grid md:grid-cols-3 gap-8 mt-14">
                                    {projects.map((project) => (
                                    <div key={project.id} className="bg-slate-800 rounded-2xl shadow-lg p-6 hover:-translate-y-2 hover:shadow-xl hover:border-sky-700 transition-all duration-300 border border-slate-700">
                                        <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                                        <p className="text-slate-400 mt-3 line-clamp-3">{project.desc}</p>
                                        <div className="flex flex-wrap gap-2 mt-5 justify-center">
                                            {project.requiredSkills.map((skill) => (
                                                <span key={skill} className="bg-sky-100 text-center text-sky-700 px-3 py-1 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-5 flex justify-between items-center">
                                            <span className="text-slate-500">👥 {project.membersRequired} Members</span>
                                            <Link to={`/projects/${project.id}`} className="text-sky-600 font-semibold hover:underline">
                                                View →
                                            </Link>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}

                        <div className="text-center mt-14">
                            <Link to="/projects" className="bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-medium transition">
                                View All Projects
                            </Link>
                        </div>

                    </div>
                </section>
            </div>
        </div>
    );
}

export default Home;