import { useEffect, useState } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import { Link } from "react-router-dom";
import { Search, Users, ArrowRight, Building2, Globe } from "lucide-react";
import Layout from "../Components/Layout";
import Loader from "../Components/Loader";
import Error from "../Components/Error";
import { useAuth } from "../Context/AuthContext";

function Project() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<project[]>([]);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Phase 1 Scope State: 'campus' | 'global'
    const [scope, setScope] = useState<"campus" | "global">("campus");

    useEffect(() => {
        getProjects(scope);
    }, [scope]);

    const getProjects = async (activeScope: "campus" | "global") => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get(`/projects?scope=${activeScope}`);
            setProjects(res.data);
        } catch (err: any) {
            console.log(err);
            setError(err.response?.data?.error || "Failed to load Projects!");
        } finally {
            setLoading(false);
        }
    };

    const displayedProjects = (search.trim() === "") ? projects : projects.filter((project) =>
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.desc.toLowerCase().includes(search.toLowerCase()) ||
        (project.requiredSkills && project.requiredSkills.some((skill) => skill.toLowerCase().includes(search.toLowerCase())))
    );

    // Helper function for rendering status badges
    const renderStatusBadge = (status?: string) => {
        switch (status) {
            case "active":
                return (
                    <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        ● Active
                    </span>
                );
            case "completed":
                return (
                    <span className="bg-slate-700/50 border border-slate-600 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        ✓ Completed
                    </span>
                );
            case "recruitment":
            default:
                return (
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Recruiting
                    </span>
                );
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-4">
                {/* Header Section */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center tracking-tight">
                    Explore Projects
                </h1>
                <p className="mt-2 text-sm md:text-base text-slate-400 max-w-xl mx-auto text-center">
                    Discover exciting student initiatives, match your skills, and start collaborating.
                </p>

                {/* Scope Selection Tabs (Campus vs. Global) */}
                <div className="flex justify-center mt-6">
                    <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
                        <button
                            onClick={() => setScope("campus")}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                                scope === "campus"
                                    ? "bg-sky-600 text-white shadow-md"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Campus Feed
                        </button>
                        <button
                            onClick={() => setScope("global")}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                                scope === "global"
                                    ? "bg-sky-600 text-white shadow-md"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            }`}
                        >
                            <Globe className="w-4 h-4" />
                            Global Feed
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex justify-center mt-6">
                    <div className="relative w-full max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title, description, or skill..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-white text-xs md:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/80 shadow-lg"
                        />
                    </div>
                </div>

                {/* Results Count Indicator */}
                <div className="w-fit mx-auto mt-4 text-xs font-medium text-slate-400">
                    {displayedProjects.length} project{displayedProjects.length !== 1 && "s"} found in {scope === "campus" ? "your university" : "global feed"}
                </div>

                {loading ? (
                    <div className="py-12"><Loader /></div>
                ) : error ? (
                    <div className="py-12"><Error className="h-60 w-60 md:h-80 md:w-80" error={error} /></div>
                ) : displayedProjects.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80 mt-8 max-w-2xl mx-auto">
                        <Building2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                        <h2 className="text-slate-300 text-lg font-semibold">No {scope} projects found</h2>
                        <p className="text-slate-500 text-xs mt-1">
                            {scope === "campus"
                                ? "Be the first to publish a project for your university!"
                                : "Try adjusting your search criteria or keywords."}
                        </p>
                    </div>
                ) : (
                    /* Project Cards Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {displayedProjects.map((project) => {
                            const isCreator = (project.creator?.id || (project.creator as any)?._id) === user?.id;
                            const activeMembersCount = project.members?.length || 1;

                            return (
                                <div
                                    key={project.id || (project as any)._id}
                                    className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-sky-700 hover:bg-slate-800/90 hover:-translate-y-1 transition-all duration-300 shadow-xl group"
                                >
                                    <div>
                                        {/* Card Metadata Header (University & Scope) */}
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                                            <span className="flex items-center gap-1 truncate text-slate-400 font-medium">
                                                <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                                <span className="truncate">{project.universityName || (project.creator as any)?.university || "Campus"}</span>
                                            </span>
                                            {renderStatusBadge(project.status)}
                                        </div>

                                        {/* Card Title & Owner Badge */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h2 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                                                {project.title}
                                            </h2>
                                            {isCreator && (
                                                <span className="shrink-0 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                                    ✓ Yours
                                                </span>
                                            )}
                                        </div>

                                        {/* Project Description */}
                                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                                            {project.desc}
                                        </p>

                                        {/* Skill Tags */}
                                        <div className="flex flex-wrap gap-1.5 mt-4">
                                            {project.requiredSkills?.slice(0, 3).map((skill, index) => (
                                                <span
                                                    key={`${skill}-${index}`}
                                                    className="bg-slate-800/80 border border-slate-700/60 text-sky-300 px-2.5 py-1 rounded-md text-[11px] font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {project.requiredSkills?.length > 3 && (
                                                <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700/60">
                                                    +{project.requiredSkills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Section */}
                                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                        <div className="flex items-center text-slate-400 gap-1.5 font-medium">
                                            <Users className="w-4 h-4 text-sky-400" />
                                            <span>
                                                {activeMembersCount} / {project.membersRequired} Members
                                            </span>
                                        </div>

                                        <Link
                                            to={`/projects/${project.id || (project as any)._id}`}
                                            className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
                                        >
                                            <span>View Details</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default Project;