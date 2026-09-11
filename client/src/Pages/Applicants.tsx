import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { application } from "../types/application";
import type { project } from "../types/project";
import Layout from "../Components/Layout";
import Error from "../Components/Error";
import Loader from "../Components/Loader";
import BackButton from "../Components/BackButton";
import { ChevronDown, Search, Users, BicepsFlexed, TrendingDown, MessageSquare, Eye, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";

function Application() {
    const { id } = useParams();
    const [project, setProject] = useState<project | null>(null);
    const [applications, setApplications] = useState<application[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
    const [scoreFilter, setScoreFilter] = useState<"all" | "excellent" | "good" | "average" | "poor">("all");

    // Selected Applicant for Modal View
    const [selectedApplicant, setSelectedApplicant] = useState<application | null>(null);

    useEffect(() => {
        getProjectApplications();
    }, [id]);

    const getProjectApplications = async () => {
        try {
            const res = await api.get(`/applications/${id}/applicants`);
            setProject(res.data.project);
            setApplications(res.data.applicants);
        } catch (err) {
            setError("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (
        applicationId: string,
        status: "accepted" | "rejected"
    ) => {
        const toastId = toast.custom(() => (
            <CustomToast type="info" title="Updating Status" message="Updating Applicant status..." />
        ), { duration: Infinity });
        try {
            await api.patch(`/applications/${applicationId}`, {
                status,
            });
            toast.remove(toastId);
            toast.custom(() => (
                <CustomToast type="success" title={`Application ${status}`} message={`The applicant has been ${status}.`} />
            ), { duration: 1500 });

            setApplications((prev) =>
                prev.map((app) =>
                    app.id === applicationId ? { ...app, status } : app
                )
            );

            // Update modal state if open
            if (selectedApplicant?.id === applicationId) {
                setSelectedApplicant((prev) => prev ? { ...prev, status } : null);
            }
        } catch (err: any) {
            toast.remove(toastId);
            toast.custom(() => (
                <CustomToast type="error" title="Action Failed" message={err.response?.data?.error || "Unable to update status."} />
            ), { duration: 1500 });
        }
    };

    const removeCollaborator = async (applicationId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this collaborator?");
        if (!confirmDelete) return;
        const toastId = toast.custom(() => (
            <CustomToast type="info" title="Removing Collaborator" message="Removing collaborator..." />
        ), { duration: Infinity });
        try {
            await api.patch(`/applications/${applicationId}/remove`);
            await getProjectApplications();
            toast.remove(toastId);
            toast.custom(() => (
                <CustomToast type="success" title="Collaborator Removed" message="Collaborator removed successfully." />
            ), { duration: 1200 });

            if (selectedApplicant?.id === applicationId) {
                setSelectedApplicant(null);
            }
        } catch (err: any) {
            toast.remove(toastId);
            toast.custom(() => (
                <CustomToast type="error" title="Removal Failed" message={err.response?.data?.error || "Failed to remove contributor."} />
            ), { duration: 1400 });
        }
    };

    const displayedApplications = applications
        .filter((application) =>
            application.applicant?.name.toLowerCase().includes(search.toLowerCase())
        )
        .filter((application) => {
            if (statusFilter === "all") return true;
            return application.status === statusFilter;
        })
        .filter((application) => {
            const score = application.aiMatchScore ?? 0;

            if (scoreFilter === "all") return true;
            if (scoreFilter === "excellent") return score >= 70;
            if (scoreFilter === "good") return score >= 50 && score < 70;
            if (scoreFilter === "average") return score >= 30 && score < 50;
            return score < 30;
        })
        .sort((a, b) => (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0));

    if (loading) return <Loader />;
    if (error) return <Error className="h-60 w-60 md:h-80 md:w-80" error={error} />;

    return (
        <Layout>
            <BackButton />
            <h2 className="text-2xl md:text-3xl font-bold text-white py-2 text-center">
                <span className="font-semibold text-slate-400">Project: </span>{project?.title}
            </h2>
            <p className="text-slate-400 py-1 text-center text-sm">Review candidate match scores and roles for your project.</p>

            {/* Search Input */}
            <div className="flex justify-center mt-6 mb-4 px-4">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search applicants by name..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700/80 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600 text-sm"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center gap-4 mt-3 px-4">
                <div className="flex items-center gap-3">
                    <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Status:</label>
                    <div className="relative w-full md:w-56">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none w-full px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/60 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">AI Match:</label>
                    <div className="relative w-full md:w-56">
                        <select
                            value={scoreFilter}
                            onChange={(e) => setScoreFilter(e.target.value as any)}
                            className="appearance-none w-full px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/60 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
                        >
                            <option value="all">All Matches</option>
                            <option value="excellent">Excellent Match (70-100%)</option>
                            <option value="good">Good Match (50-69%)</option>
                            <option value="average">Fair Match (30-49%)</option>
                            <option value="poor">Poor Match (0-29%)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>

            <div className="w-fit mx-auto mt-6 flex items-center gap-2">
                <Users className="text-sky-500 w-4 h-4" />
                <p className="text-slate-300 text-xs font-medium">{displayedApplications.length} applicant{displayedApplications.length !== 1 && "s"} found</p>
            </div>

            {/* Applicant Summary Cards List */}
            {displayedApplications.length === 0 ? (
                <div className="text-center my-12">
                    <h3 className="text-slate-400 text-xl font-semibold">No Applications Found</h3>
                    <p className="text-slate-500 text-sm mt-1">No candidates match your current filter criteria.</p>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto px-4 mt-6 grid grid-cols-1 gap-4 ">
                    {displayedApplications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-slate-000 hover:bg-slate-800 backdrop-blur-md border border-sky-600 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-sky-700 transition shadow-lg"
                        >
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-white">{app.applicant.name}</h3>

                                    {/* Status Badge */}
                                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                                        app.status === "accepted"
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : app.status === "pending"
                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    }`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                </div>

                                {/* Matched Role Badge */}
                                {app.assignedRole && (
                                    <div className="flex items-center gap-1.5 text-purple-300 text-xs font-medium">
                                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                        <span>Matched Role: <strong className="text-white">{app.assignedRole}</strong></span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/80">
                                {/* Match Score */}
                                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                                    (app.aiMatchScore ?? 0) >= 70
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : (app.aiMatchScore ?? 0) >= 50
                                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}>
                                    <span>Match:</span>
                                    <span className="text-sm">{app.aiMatchScore ?? 0}%</span>
                                </div>

                                {/* View Applicant Button */}
                                <button
                                    onClick={() => setSelectedApplicant(app)}
                                    className="bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View Applicant</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Applicant Details Modal */}
            {selectedApplicant && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#131A29] border border-slate-700/80 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setSelectedApplicant(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-white">{selectedApplicant.applicant.name}</h3>
                            <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                                selectedApplicant.status === "accepted"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : selectedApplicant.status === "pending"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                                {selectedApplicant.status.charAt(0).toUpperCase() + selectedApplicant.status.slice(1)}
                            </span>
                        </div>

                        {selectedApplicant.assignedRole && (
                            <div className="bg-purple-950/40 border border-purple-500/30 p-2.5 rounded-xl text-xs text-purple-200 flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span>AI Matched Role: <strong className="text-white font-bold">{selectedApplicant.assignedRole}</strong></span>
                                <span className="ml-auto font-bold text-emerald-400">{selectedApplicant.aiMatchScore}% Match</span>
                            </div>
                        )}

                        <p className="text-slate-400 text-xs mb-4 leading-relaxed">{selectedApplicant.applicant.bio || "No bio available."}</p>

                        {/* Skills */}
                        <div className="mb-4">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-2">Skills</span>
                            <div className="flex flex-wrap gap-1.5">
                                {(selectedApplicant.applicant.skills || []).map((skill, idx) => (
                                    <span key={idx} className="bg-slate-800 text-sky-300 text-xs px-2.5 py-1 rounded-lg font-medium border border-slate-700/60">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Cover Note */}
                        {selectedApplicant.message && (
                            <div className="mb-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                                <span className="text-sky-400 text-xs font-semibold flex items-center gap-1.5 mb-1">
                                    <MessageSquare className="w-3.5 h-3.5" /> Cover Note
                                </span>
                                <p className="text-slate-300 text-xs italic leading-relaxed">"{selectedApplicant.message}"</p>
                            </div>
                        )}

                        {/* AI Strengths & Areas to Improve */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-2">
                                    <BicepsFlexed className="w-4 h-4" />
                                    <span>Strengths</span>
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                                    {(selectedApplicant.strengths || []).map((s, idx) => (
                                        <li key={idx}>{s}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-2">
                                    <TrendingDown className="w-4 h-4" />
                                    <span>Areas to Improve</span>
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                                    {(selectedApplicant.weaknesses || []).map((w, idx) => (
                                        <li key={idx}>{w}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                            {selectedApplicant.status === "pending" && (
                                <>
                                    <button
                                        onClick={() => updateStatus(selectedApplicant.id, "accepted")}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                                    >
                                        Accept Applicant
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedApplicant.id, "rejected")}
                                        className="border border-rose-500/40 text-rose-400 hover:bg-rose-950/60 font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {selectedApplicant.status === "accepted" && (
                                <button
                                    onClick={() => removeCollaborator(selectedApplicant.id)}
                                    className="border border-rose-500/40 text-rose-400 hover:bg-rose-950/60 font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                                >
                                    Remove Collaborator
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default Application;