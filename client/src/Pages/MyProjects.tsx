import { useState, useEffect } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import { useNavigate } from "react-router-dom";
import Layout from "../Components/Layout";
import Loader from "../Components/Loader";
import Error from "../Components/Error";
import { Users, Search, UserRoundPlus, MessageSquare, CheckCircle, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";

function MyProjects() {
    const [projects, setProjects] = useState<project[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();

    useEffect(() => {
        getMyProjects();
    }, []);

    const getMyProjects = async () => {
        try {
            const res = await api.get("/projects/my");
            setProjects(res.data);
        } catch (err: unknown) {
            setError("Failed to fetch your Projects");
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if (!confirmDelete) return;
        const toastId = toast.custom(() => (
            <CustomToast type="info" title="Deletion in Process" message="Your project is being deleted" />
        ), { duration: 1200 });
        try {
            await api.delete(`projects/${id}`);
            setProjects((prev) => prev.filter((p) => (p.id || (p as any)._id) !== id));
            toast.remove(toastId);
            toast.custom(() => (
                <CustomToast type="success" title="Project Deleted" message="Your project has been deleted successfully." />
            ), { duration: 1200 });
        } catch (err: any) {
            toast.remove(toastId);
            toast.custom(() => (
                <CustomToast type="error" title="Deletion Failed" message={err.response?.data?.error || "Failed to delete your project"} />
            ), { duration: 1400 });
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedProjects((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const displayedProjects = (search.trim() === "") ? projects : projects.filter((project) =>
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.desc.toLowerCase().includes(search.toLowerCase()) ||
        project.requiredSkills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <Loader />;
    if (error) return <Error className="h-60 w-60 md:h-80 md:w-80" error={error} />;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-4">
                {/* Page Title */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center tracking-tight">
                    My Projects
                </h1>
                <p className="mt-2 text-sm md:text-base text-slate-400 max-w-xl mx-auto text-center">
                    Manage your created projects, track team applications, and launch project chatrooms.
                </p>

                {/* Search Bar */}
                <div className="flex justify-center mt-6">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search your projects..."
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-sky-700 bg-slate-900/80 text-white text-xs md:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/80 shadow-md"
                        />
                    </div>
                </div>

                {/* Counter Tag */}
                <div className="w-fit mx-auto mt-4 text-xs font-medium text-slate-400">
                    {displayedProjects.length} project{displayedProjects.length !== 1 && "s"} found
                </div>

                {/* Empty State */}
                {displayedProjects.length === 0 ? (
                    <div className="text-center py-16">
                        <h2 className="text-slate-400 text-lg font-semibold">No projects found</h2>
                        <p className="text-slate-500 text-xs mt-1">Try searching with different keywords or create a new project.</p>
                    </div>
                ) : (
                    /* Projects List */
                    <div className="space-y-6 mt-6">
                        {displayedProjects.map((project: any) => {
                            const projectId = project.id || project._id;
                            const isExpanded = !!expandedProjects[projectId];
                            const acceptedCount = (project.acceptedCount ?? project.acceptedMembersCount) || 0;
                            const totalMembers = 1 + acceptedCount; // Creator + accepted members

                            return (
                                <div
                                    key={projectId}
                                    className="bg-slate-900/60 backdrop-blur-md border border-sky-700 rounded-2xl p-6 shadow-xl hover:border-sky-500 hover:bg-slate-800 transition-all duration-300"
                                >
                                    {/* Card Header: Title + Chat Room Button */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-700/60 pb-4">
                                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                            {project.title}
                                        </h2>

                                        <button
                                            onClick={() => navigate(`/chat/${projectId}`)}
                                            className="flex items-center justify-center gap-1.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                                            <span>Chat Room</span>
                                        </button>
                                    </div>

                                    {/* Description */}
                                    <div className="text-slate-300 pt-3 text-xs md:text-sm leading-relaxed">
                                        <p className={isExpanded ? "" : "line-clamp-3"}>{project.desc}</p>
                                        {project.desc.length > 180 && (
                                            <button
                                                onClick={() => toggleExpand(projectId)}
                                                className="mt-2 text-sky-400 hover:text-sky-300 text-xs font-semibold cursor-pointer"
                                            >
                                                {isExpanded ? "Read Less" : "Read More"}
                                            </button>
                                        )}
                                    </div>

                                    {/* Required Skills Badges */}
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {project.requiredSkills.map((skill: string, index: number) => (
                                            <span
                                                key={`${skill}-${index}`}
                                                className="bg-slate-800/80 border border-slate-700/60 text-sky-300 hover:text-white hover:bg-sky-600/30 hover:border-sky-500/50 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Team Metrics Bar */}
                                    <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium border-t border-sky-700/40 pt-4">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <Users className="text-sky-500 w-4 h-4" />
                                            <span>{project.membersRequired} Members Required</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-lg text-purple-300 font-semibold">
                                            <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                                            <span>{totalMembers} Active ({acceptedCount} Accepted + 1 Leader)</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                            <UserRoundPlus className="w-4 h-4 text-emerald-400" />
                                            <span>{project.applicantCount ?? 0} Applicants</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons Row */}
                                    <div className="mt-5 pt-4 border-t border-sky-700/60 flex flex-col sm:flex-row justify-between items-center gap-3">
                                        <button
                                            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-semibold px-5 py-2 rounded-xl transition cursor-pointer text-xs shadow-sm"
                                            onClick={() => navigate(`/applications/${projectId}/applicants`)}
                                        >
                                            View Applicants
                                        </button>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <button
                                                className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
                                                onClick={() => navigate(`/project/${projectId}/edit`)}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                <span>Edit Project</span>
                                            </button>

                                            <button
                                                className="bg-slate-950 hover:bg-rose-950/60 border border-sky-700 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 font-semibold px-4 py-2 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5"
                                                onClick={() => deleteProject(projectId)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
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

export default MyProjects;