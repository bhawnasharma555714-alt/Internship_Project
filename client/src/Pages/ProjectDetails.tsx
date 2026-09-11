import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";
import type { project } from "../types/project";
import Layout from "../Components/Layout";
import { ArrowLeft, Users, FileText, Brain, Palette, Send, X, MessageSquare, CheckCircle2, Clock, XCircle } from "lucide-react";
import Error from "../Components/Error";
import Loader from "../Components/Loader";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";
import { useAuth } from "../Context/AuthContext";
import socket from "../socket";

type Application = {
    id: string;
    project: any;
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

    // Check project ownership safely handling populated object or string ID
    const creatorId = project?.creator?.id || (project?.creator as any)?._id || project?.creator;
    const currentUserId = user?.id || (user as any)?._id;
    const isOwner = Boolean(creatorId && currentUserId && String(creatorId) === String(currentUserId));

    useEffect(() => {
        if (id) {
            socket.emit("joinProject", id);
        }
    }, [id]);

    useEffect(() => {
        getProject();
    }, [id]);

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

    // Match current user's application for this project safely
    const myApplication = applications.find((app) => {
        const appProjectId = typeof app.project === "object" ? (app.project.id || app.project._id) : app.project;
        return String(appProjectId) === String(id);
    });

    const isAccepted = myApplication?.status === "accepted";
    const isPending = myApplication?.status === "pending";
    const isRejected = myApplication?.status === "rejected";

    const getProject = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            const projectData = res.data.project || res.data;
            setProject(projectData);
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
                message: applyMessage,
            });

            toast.custom(
                () => (
                    <CustomToast
                        type="success"
                        title="Application Submitted"
                        message="Your application has been sent successfully."
                    />
                ),
                { duration: 1500 }
            );

            setShowApplyModal(false);
            setApplyMessage("");

            // Refresh user applications list
            const response = await api.get("/applications/my");
            setApplications(response.data);
        } catch (err: any) {
            toast.custom(
                () => (
                    <CustomToast
                        type="error"
                        title="Application Failed"
                        message={err.response?.data?.error || err.response?.data?.message || "Failed to submit application"}
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
            <div className="flex items-center mb-6">
                <ArrowLeft className="text-slate-400 h-8 w-8 font-bold hover:text-slate-300 cursor-pointer" onClick={() => navigate(`/projects`)} />
                <button
                    className="pl-2 font-semibold text-slate-400 text-2xl hover:text-slate-300 cursor-pointer"
                    onClick={() => navigate(`/projects`)}
                >
                    Back to Projects
                </button>
            </div>

            {project && (
                <div className="max-w-2xl mx-auto border-4 border-slate-700 mt-6 p-8 md:p-10 text-left rounded-2xl hover:border-slate-600 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)] bg-slate-900/50">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl md:text-4xl font-bold text-white">{project.title}</h2>
                        {isOwner && (
                            <div className="inline-flex w-fit bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-lg text-xs font-bold">
                                ✓ Your Project (Owner)
                            </div>
                        )}
                    </div>

                    <section className="text-slate-300 mt-4 py-4 flex flex-col gap-6">
                        <div className="max-w-3xl leading-relaxed">
                            <div className="flex flex-row items-center mb-2">
                                <FileText className="w-6 h-6 text-sky-500 mr-2" />
                                <p className="text-slate-400 font-bold text-sm tracking-wider uppercase">DESCRIPTION</p>
                            </div>
                            <p className={`text-slate-300 ${expanded ? "" : "line-clamp-3"}`}>{project.desc}</p>
                            {project.desc.length > 180 && (
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="mt-2 text-sky-400 hover:text-sky-300 text-xs font-semibold cursor-pointer"
                                >
                                    {expanded ? "Read Less" : "Read More"}
                                </button>
                            )}
                        </div>

                        <div>
                            <div className="flex flex-row items-center mb-1">
                                <Palette className="w-6 h-6 text-sky-500 mr-2" />
                                <p className="text-slate-400 font-bold text-sm tracking-wider uppercase">CREATED BY</p>
                            </div>
                            <p className="text-slate-200 font-semibold">{project.creator?.name || "Project Creator"}</p>
                        </div>
                    </section>

                    <section className="flex flex-col mt-2">
                        <div className="flex flex-row items-center mb-2">
                            <Brain className="w-6 h-6 text-sky-500 mr-2" />
                            <p className="text-slate-400 font-bold text-sm tracking-wider uppercase">Required Skills</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(project.requiredSkills || []).map((skill, index) => (
                                <span
                                    key={`${skill}-${index}`}
                                    className="bg-sky-950 text-sky-300 border border-sky-800/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Footer Actions Section */}
                    <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center text-slate-400 font-medium text-sm">
                            <Users className="text-sky-500 w-5 h-5 mr-2" />
                            <span>{project.membersRequired} Members Required</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* OWNER VIEW */}
                            {isOwner && (
                                <>
                                    <button
                                        className="bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
                                        onClick={() => navigate(`/applications/${id}/applicants`)}
                                    >
                                        View Applicants
                                    </button>

                                    <button
                                        className="bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                                        onClick={() => navigate(`/chat/${id}`)}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Open Chatroom</span>
                                    </button>
                                </>
                            )}

                            {/* NON-OWNER: ACCEPTED MEMBER VIEW */}
                            {!isOwner && isAccepted && (
                                <>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Accepted Member</span>
                                    </div>

                                    <button
                                        className="bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                                        onClick={() => navigate(`/chat/${id}`)}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Open Chatroom</span>
                                    </button>
                                </>
                            )}

                            {/* NON-OWNER: PENDING APPLICANT VIEW */}
                            {!isOwner && isPending && (
                                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>Already Applied (Pending)</span>
                                </div>
                            )}

                            {/* NON-OWNER: REJECTED APPLICANT VIEW */}
                            {!isOwner && isRejected && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                                    <XCircle className="w-4 h-4" />
                                    <span>Application Declined</span>
                                </div>
                            )}

                            {/* NON-OWNER: NOT YET APPLIED */}
                            {!isOwner && !myApplication && (
                                <button
                                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer"
                                    onClick={() => setShowApplyModal(true)}
                                >
                                    Apply
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Cover Note Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#131A29] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowApplyModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
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
                                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isApplying}
                                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
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