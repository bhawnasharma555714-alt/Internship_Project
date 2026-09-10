import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import Layout from "../Components/Layout";
import { ArrowLeft, Users, FileText, Brain, Palette, Send, X } from "lucide-react";
import Error from "../Components/Error";
import Loader from "../Components/Loader";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";
import { useAuth } from "../Context/AuthContext";
import socket from "../socket";

type Application = {
    project: string;
    status: string;
};

function ProjectDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState<project | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Modal State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyMessage, setApplyMessage] = useState("");

    const navigate = useNavigate();
    const isOwner = project?.creator?.id === user?.id;

    useEffect(() => {
        if (id) {
            socket.emit("joinProject", id);
        }
    }, [id]);

    useEffect(() => {
        getProject();
    }, []);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get("/applications/my");
                setApplications(response.data);
            } catch (error) {
                console.error("Error fetching applications:", error);
            }
        };

        if (user) {
            fetchApplications();
        }
    }, [user]);

    const isAccepted = applications.some(
        app => app.project === project?.id && app.status === "accepted"
    );

    const getProject = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        } catch (err) {
            setError("Project Not Found");
        } finally {
            setLoading(false);
        }
    };

    const handleApplySubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsApplying(true);
        try {
            await api.post(`/applications/${id}/apply`, {
                projectId: id,
                message: applyMessage, // Sent optionally to backend & Gemini
            });

            toast.custom(
                () => (
                    <CustomToast
                        type="success"
                        title="Application Submitted"
                        message="Your Application has been sent successfully."
                    />
                ),
                { duration: 1500 }
            );

            setShowApplyModal(false);
            setApplyMessage("");
            
            // Refresh applications list
            const response = await api.get("/applications/my");
            setApplications(response.data);
        } catch (err: any) {
            toast.custom(
                () => (
                    <CustomToast
                        type="error"
                        title="Application Failed"
                        message={err.response?.data?.error || err.response?.data?.message || "Failed to submit Application"}
                    />
                ),
                { duration: 2000 }
            );
        } finally {
            setIsApplying(false);
        }
    };

    if (loading) return <Loader />;
    if (error) return <Error className="h-50 w-50 md:h-80 md:w-80" error={error} />;

    return (
        <Layout>
            <div className="flex items-center">
                <ArrowLeft className="text-slate-400 h-8 w-8 font-bold hover:text-slate-300" />
                <button
                    className="pl-2 font-semibold text-slate-400 text-2xl hover:text-slate-300"
                    onClick={() => navigate(`/projects`)}
                >
                    Back to Projects
                </button>
            </div>

            {project && (
                <div className="max-w-2xl mx-auto border-4 border-slate-700 mt-10 p-10 text-left rounded-2xl hover:border-slate-600 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)]">
                    <div className="flex-col">
                        <h2 className="text-2xl md:text-4xl font-bold text-white">{project.title}</h2>
                        {isOwner && (
                            <div className="inline-flex bg-green-500/20 text-green-400 mt-3 px-4 py-2 rounded-lg font-semibold">
                                ✓ Your Project
                            </div>
                        )}
                    </div>

                    <section className="text-slate-300 mt-3 line-clamp-3 py-6 flex flex-col gap-6">
                        <div className="max-w-3xl leading-8">
                            <div className="flex flex-row">
                                <FileText className="w-7 h-7 mt-2 text-sky-500" />
                                <p className="text-slate-400 font-semibold text-xl pr-4 pl-4 py-2">DESCRIPTION</p>
                            </div>
                            <p className={expanded ? "" : "line-clamp-3"}>{project.desc}</p>
                            {project.desc.length > 180 && (
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="mt-2 text-sky-500 hover:text-sky-400 text-sm font-medium"
                                >
                                    {expanded ? "Read Less" : "Read More"}
                                </button>
                            )}
                        </div>

                        <div>
                            <div className="flex flex-row">
                                <Palette className="w-7 h-7 mt-2 text-sky-500" />
                                <p className="text-slate-400 font-semibold text-xl pr-4 pl-4 py-2">CREATED BY</p>
                            </div>
                            <p>{project.creator?.name.toString()}</p>
                        </div>
                    </section>

                    <section className="flex flex-col">
                        <div className="flex flex-row">
                            <Brain className="w-7 h-7 mt-2 text-sky-500" />
                            <p className="text-xl text-slate-400 py-2 pl-4 font-semibold">Required Skills</p>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1">
                            {project.requiredSkills.map((skill, index) => (
                                <span
                                    key={`${skill}-${index}`}
                                    className="bg-sky-100 text-sky-900 px-3.5 md:px-5 py-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:cursor-pointer"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
                        <div className="mt-6 flex items-center">
                            <Users className="text-sky-500 w-6 h-6 md:w-7 md:h-7" />
                            <span className="pl-1 md:pl-2 text-slate-400 font-medium">
                                {project.membersRequired} Members
                            </span>
                        </div>

                        {isOwner ? (
                            <button
                                className="bg-sky-700 text-white font-medium px-4 md:px-8 py-2 md:py-3 mt-6 rounded-lg hover:bg-sky-600 transition-colors"
                                onClick={() => navigate(`/applications/${project.id}/applicants`)}
                            >
                                View Applicants
                            </button>
                        ) : (
                            <button
                                className="bg-sky-700 text-white font-medium px-8 py-2 mt-6 rounded-lg hover:bg-sky-600 transition-colors"
                                onClick={() => setShowApplyModal(true)}
                            >
                                Apply
                            </button>
                        )}

                        {(isOwner || isAccepted) && (
                            <button className="text-white" onClick={() => navigate(`/chat/${id}`)}>
                                Open Chat
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Optional Cover Note Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#131A29] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowApplyModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-1">Apply to {project?.title}</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            Send an optional message to the project creator to introduce yourself and highlight your experience.
                        </p>

                        <form onSubmit={handleApplySubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Cover Note / Message <span className="text-slate-500 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={applyMessage}
                                    onChange={(e) => setApplyMessage(e.target.value)}
                                    placeholder="Introduce yourself or leave blank to apply using your profile details..."
                                    className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isApplying}
                                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{isApplying ? "Submitting..." : "Send Application"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default ProjectDetails;