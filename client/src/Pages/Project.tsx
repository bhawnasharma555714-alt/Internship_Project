import { useEffect, useState } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import { Link } from "react-router-dom";
import { Search, Users, ArrowRight} from "lucide-react";
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

    useEffect(() => {
        getProjects();
    }, []);

    const getProjects = async () => {
        try {
            const res = await api.get("/projects");
            setProjects(res.data);
        } catch (err) {
            console.log(err);
            setError("Failed to load Projects!");
        } finally {
            setLoading(false);
        }
    };

    const displayedProjects = (search.trim() === "") ? projects : projects.filter((project) =>
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.desc.toLowerCase().includes(search.toLowerCase()) ||
        project.requiredSkills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return (<Loader />);
    if (error) return (<Error className="h-60 w-60 md:h-80 md:w-80" error={error} />);

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
                    {displayedProjects.length} project{displayedProjects.length !== 1 && "s"} found
                </div>

                {/* Empty State */}
                {displayedProjects.length === 0 ? (
                    <div className="text-center py-16">
                        <h2 className="text-slate-400 text-xl font-semibold">No projects found</h2>
                        <p className="text-slate-500 text-xs mt-1">Try adjusting your search criteria or keywords.</p>
                    </div>
                ) : (
                    /* Project Cards Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {displayedProjects.map((project) => {
                            const isCreator = (project.creator?.id || (project.creator as any)?._id) === user?.id;

                            return (
                                <div
                                    key={project.id || (project as any)._id}
                                    className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-sky-700 p-6 flex flex-col justify-between hover:border-sky-700 hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 shadow-xl group"
                                >
                                    <div>
                                        {/* Card Title & Owner Badge */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h2 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                                                {project.title}
                                            </h2>
                                            {isCreator && (
                                                <span className="shrink-0 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2.5 py-1 rounded-md">
                                                    ✓ Your Project
                                                </span>
                                            )}
                                        </div>

                                        {/* Project Description */}
                                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                                            {project.desc}
                                        </p>

                                        {/* Skill Tags */}
                                        <div className="flex flex-wrap gap-1.5 mt-4">
                                            {project.requiredSkills.slice(0, 3).map((skill, index) => (
                                                <span
                                                    key={`${skill}-${index}`}
                                                    className="bg-slate-800/80 border border-slate-700/60 text-sky-300 px-2.5 py-1 rounded-md text-[11px] font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {project.requiredSkills.length > 3 && (
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
                                            <span>{project.membersRequired} Members</span>
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