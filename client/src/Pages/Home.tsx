import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import HeroVideo from "../assets/scrumBoard.webm";
import { Users, FolderOpen, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useState } from 'react';
import type { project } from '../types/project';
import api from '../services/api';
import Layout from '../Components/Layout';
import Error from '../Components/Error';
import Loader from '../Components/Loader';

function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getProjects();
    }, []);

    const getProjects = async () => {
        try {
            const res = await api.get("/projects");
            setProjects(res.data.slice(0, 3));
        } catch (err) {
            setError("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 bg-[#0B0F17]">
                <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl text-center font-bold text-white leading-tight">
                        Build Projects <span className="text-sky-600">Together</span>
                    </h1>
                    <p className="mt-6 text-0.5xl text-slate-400 md:text-xl text-center md:text-slate-500 max-w-2xl mx-auto">
                        Discover exciting student projects, connect with teammates, and build real-world experience.
                    </p>

                    {!user ? (
                        <Link to="/login">
                            <div className="mt-10 font-medium flex justify-center gap-4">
                                <button className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors cursor-pointer">
                                    Login/Signup
                                </button>
                            </div>
                        </Link>
                    ) : (
                        <div className="mt-10 flex justify-center gap-4">
                            <button
                                className="bg-sky-800 font-medium text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors cursor-pointer"
                                onClick={() => navigate('/projects')}
                            >
                                See Projects
                            </button>
                            <button
                                className="bg-sky-800 font-medium text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors cursor-pointer"
                                onClick={() => navigate('/create-project')}
                            >
                                Upload your Project
                            </button>
                        </div>
                    )}
                </div>

                {/* Restored Hero Video */}
                <div className="flex justify-center">
                    <video autoPlay loop muted playsInline className="w-full max-w-sm md:max-w-md lg:max-w-xl mx-auto">
                        <source src={HeroVideo} type="video/webm" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>

            {/* Why CollabConnect Section */}
            <section className="max-w-7xl mx-auto px-6 my-10">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white">Why CollabConnect?</h2>
                <p className="text-center text-slate-400 mt-4 max-w-2xl mx-auto">
                    Everything you need to find teammates, collaborate on projects, and build an impressive portfolio.
                </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-slate-900/60 backdrop-blur-md border border-sky-700 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:border-sky-700 transition-all duration-300">
                    <Users className="w-12 h-12 text-sky-500" />
                    <h3 className="text-xl font-semibold mt-5 text-white hovertext-">Find Teammates</h3>
                    <p className="text-slate-400 mt-3">Connect with students who have the skills and passion to bring ideas to life.</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-md border border-sky-700 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:border-sky-700 transition-all duration-300">
                    <FolderOpen className="w-12 h-12 text-sky-500" />   
                    <h3 className="text-xl font-semibold mt-5 text-white hovertext-">Discover Projects</h3>
                    <p className="text-slate-400 mt-3">Browse innovative student projects and join the ones that excite you.</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-md border border-sky-700 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:border-sky-700 transition-all duration-300">
                    <Sparkles className="w-12 h-12 text-sky-500" />
                    <h3 className="text-xl font-semibold mt-5 text-white hovertext-">AI Matching</h3>
                    <p className="text-slate-400 mt-3">Receive AI-powered recommendations and personalized project feedback.</p>
                </div>
            </div>

            {/* Featured Projects Section */}
            <section className="pt-16 pb-6">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white">Featured Projects</h2>
                <p className="text-center text-slate-400 mt-4 max-w-2xl mx-auto">Explore exciting projects created by students and start collaborating today.</p>
            </section>

            {loading && <Loader />}
            {error && <Error className='h-40 w-40' error={error} />}

            {!loading && !error && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {projects.map((project: any) => {
                            const projectId = project.id || project._id;
                            return (
                                <div
                                    key={projectId}
                                    className="bg-slate-900/60 backdrop-blur-md border border-sky-700 rounded-2xl p-6 shadow-xl hover:-translate-y-1.5 hover:border-sky-500 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <h3 className="text-2xl font-semibold text-white truncate">{project.title}</h3>
                                        <p className="text-slate-400 mt-3 line-clamp-3">{project.desc || project.description}</p>

                                        <div className="flex flex-wrap gap-2 mt-5">
                                            {(project.requiredSkills || project.skillsRequired || []).map((skill: string, index: number) => (
                                                <span
                                                    key={`${skill}-${index}`}
                                                    className="bg-slate-800/80 border border-slate-700/60 text-sky-300 hover:text-white hover:bg-sky-600/30 hover:border-sky-500/50 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-sky-700/60 flex flex-row justify-between items-center text-sm">
                                        <div className="flex flex-row items-center gap-2 text-slate-400">
                                            <Users size={20} className="text-sky-500" />
                                            <span>{project.membersRequired || project.memberRequired || 1} Members</span>
                                        </div>

                                        <Link to={`/projects/${projectId}`} className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition">
                                            <span>View Details</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-row justify-center items-center mt-8">
                        <Link to="/projects" className="bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-medium transition cursor-pointer">
                            View All Projects
                        </Link>
                    </div>
                </>
            )}
        </Layout>
    );
}

export default Home;