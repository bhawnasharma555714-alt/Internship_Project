import api from "../services/api";
import { useState, useEffect } from "react";
import type { application } from "../types/application";
import Layout from "../Components/Layout";
import Error from "../Components/Error";
import Loader from "../Components/Loader";
import { Search, ChevronDown, BicepsFlexed, TrendingDown, Sparkles, Users, MessageSquare, ArrowRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AIAnalysisLoader from "../Components/AiAnalysisLoader";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";

function MyApplications() {
    const [applications, setApplications] = useState<application[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [showLoader, setShowLoader] = useState(false);
    const [loaderState, setLoaderState] = useState<"loading" | "success" | "error">("loading");
    const [loaderMessage, setLoaderMessage] = useState("");
    const [currentApplicationId, setCurrentApplicationId] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getMyApplications();
    }, []);

    const getMyApplications = async () => {
        try {
            const res = await api.get('/applications/my');
            setApplications(res.data);
        } catch (err: unknown) {
            console.log(err);
            setError("Failed to fetch your applications");
        } finally {
            setLoading(false);
        }
    };

    const deleteApplication = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to withdraw this Application?");
        if (!confirmDelete) return;
        const toastId = toast.custom(
            () => <CustomToast type="info" title="Withdrawing Application" message="Withdrawal in process..." />,
            { duration: Infinity }
        );
        try {
            await api.delete(`/applications/${id}`);
            setApplications((prev) => prev.filter((app) => app.id !== id));
            toast.remove(toastId);
            toast.custom(
                () => <CustomToast type="success" title="Application Withdrawn" message="Your application has been withdrawn successfully." />,
                { duration: 1200 }
            );
        } catch (err) {
            toast.remove(toastId);
            toast.custom(
                () => <CustomToast type="error" title="Withdrawal Failed" message="Failed to withdraw your application. Please try again!" />,
                { duration: 1200 }
            );
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleAnalyze = async (applicationId: string) => {
        setCurrentApplicationId(applicationId);
        setAnalyzingId(applicationId);
        setShowLoader(true);
        setLoaderState("loading");
        setLoaderMessage("Analyzing your profile match...");

        try {
            const response = await api.patch(`/applications/${applicationId}/analyze`);
            setApplications(prev => prev.map(app => app.id === applicationId ? response.data : app));
            setLoaderState("success");
            setTimeout(() => { setShowLoader(false); }, 1000);
        } catch (err: any) {
            setLoaderState("error");
            setLoaderMessage(err.response?.data?.error || "Something went wrong.");
            console.log(err);
        } finally {
            setAnalyzingId(null);
        }
    };

    const displayedApplications = applications
        .filter((application) =>
            (application.project?.title ?? "").toLowerCase().includes(search.toLowerCase())
        )
        .filter((application) => {
            if (statusFilter === "all") return true;
            return application.status === statusFilter;
        });

    if (loading) return <Loader />;
    if (error) return <Error className="h-50 w-50 md:h-80 md:w-80" error={error} />;

    return (
        <Layout>
            {showLoader && (
                <AIAnalysisLoader
                    state={loaderState}
                    message={loaderMessage}
                    onClose={() => setShowLoader(false)}
                    onRetry={() => handleAnalyze(currentApplicationId)}
                />
            )}

            <div className="max-w-4xl mx-auto px-4 py-4">
                {/* Header */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center tracking-tight">
                    My Applications
                </h1>
                <p className="mt-2 text-sm md:text-base text-slate-400 text-center">
                    Track and review all your submitted project applications.
                </p>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-6">
                    {/* Search Bar */}
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search applications..."
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-sky-700 bg-slate-900/80 text-white text-xs md:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/80 shadow-md"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative w-full md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none w-full px-4 py-2.5 rounded-xl border border-sky-700 bg-slate-900/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/80 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                </div>

                {/* Counter Tag */}
                <div className="w-fit mx-auto mt-4 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Users className="w-4 h-4 text-sky-500" />
                    <span>{displayedApplications.length} application{displayedApplications.length !== 1 && "s"} found</span>
                </div>

                {/* Empty State */}
                {displayedApplications.length === 0 && (
                    <div className="text-center py-16">
                        <h2 className="text-slate-400 text-lg font-semibold">No applications found</h2>
                        <p className="text-slate-500 text-xs mt-1 mb-4">You haven't applied to any projects matching this criteria.</p>
                        {statusFilter === "all" && (
                            <button
                                onClick={() => navigate('/projects')}
                                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                            >
                                Browse Projects
                            </button>
                        )}
                    </div>
                )}

                {/* Application Cards List */}
                <div className="space-y-6 mt-6">
                    {displayedApplications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-slate-900/60 backdrop-blur-md border border-sky-700 rounded-2xl p-6 shadow-xl hover:border-sky-500 hover:bg-slate-800 transition-all duration-300"
                        >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-700/60 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white hover:text-sky-400 transition cursor-pointer" onClick={() => navigate(`/projects/${app.project.id || (app.project as any)._id}`)}>
                                        {app.project.title}
                                    </h2>
                                    {app.assignedRole && (
                                        <div className="flex items-center gap-1.5 text-purple-300 text-xs font-medium mt-1">
                                            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                            <span>Matched Role: <strong className="text-white">{app.assignedRole}</strong></span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-center">
                                    {/* AI Score Badge */}
                                    {app.aiMatchScore !== null && (
                                        <div className={`px-3 py-1 rounded-xl text-xs font-bold ${
                                            app.aiMatchScore >= 70
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : app.aiMatchScore >= 50
                                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                        }`}>
                                            {app.aiMatchScore}% Match
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                                        app.status === "accepted"
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : app.status === "pending"
                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    }`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Cover Note Section */}
                            {app.message && (
                                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/40 border border-sky-700/50">
                                    <span className="text-sky-400 text-[11px] font-semibold flex items-center gap-1.5 mb-1">
                                        <MessageSquare className="w-3.5 h-3.5" /> Your Cover Note
                                    </span>
                                    <p className="text-slate-300 text-xs italic leading-relaxed">
                                        "{app.message}"
                                    </p>
                                </div>
                            )}

                            {/* Strengths & Weaknesses Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl">
                                    <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5 mb-2">
                                        <BicepsFlexed className="w-4 h-4" /> Strengths
                                    </span>
                                    {app.strengths.length === 0 ? (
                                        <p className="text-slate-500 text-xs italic">AI evaluation pending.</p>
                                    ) : (
                                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                                            {app.strengths.map((s, idx) => (
                                                <li key={idx}>{s}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="bg-amber-950/20 border border-amber-500/20 p-3.5 rounded-xl">
                                    <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5 mb-2">
                                        <TrendingDown className="w-4 h-4" /> Areas to Improve
                                    </span>
                                    {app.weaknesses.length === 0 ? (
                                        <p className="text-slate-500 text-xs italic">AI evaluation pending.</p>
                                    ) : (
                                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                                            {app.weaknesses.map((w, idx) => (
                                                <li key={idx}>{w}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="mt-5 pt-4 border-t border-sky-700/60 flex items-center justify-between">
                                {/* Trigger AI Evaluation Button if missing */}
                                {app.aiMatchScore === null && app.status === "pending" ? (
                                    <button
                                        disabled={analyzingId === app.id}
                                        onClick={() => handleAnalyze(app.id)}
                                        className="flex items-center gap-1.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                        <span>{analyzingId === app.id ? "Analyzing..." : "Analyze with AI"}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/projects/${app.project.id || (app.project as any)._id}`)}
                                        className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                                    >
                                        <span>View Project</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                )}

                                {/* Withdraw Application Button */}
                                <button
                                    onClick={() => deleteApplication(app.id)}
                                    className="bg-slate-950 hover:bg-rose-950/60 border border-sky-700 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Withdraw</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

export default MyApplications;