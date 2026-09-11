import { useState, type SyntheticEvent } from "react";
import api from "../services/api";
import Layout from "../Components/Layout";
import BackButton from "../Components/BackButton";
import { Pencil, Sparkles, Check, X, ArrowRight, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";

interface AISuggestions {
    suggestedTitle: string;
    suggestedDesc: string;
    suggestedSkills: string[];
    suggestedMembers: number;
    suggestedRoles: string[];
}

function CreateProject() {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [skillsRequired, setSkillsRequired] = useState("");
    const [memberRequired, setMembersRequired] = useState(1);

    // AI Analysis Modal State
    const [analyzing, setAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    const handleAnalyzeDraft = async () => {
        if (!title && !desc) {
            toast.custom(
                () => <CustomToast type="error" title="Input Required" message="Please enter a title or description first." />,
                { duration: 2000 }
            );
            return;
        }

        setAnalyzing(true);
        const toastId = toast.custom(
            () => <CustomToast type="info" title="Analyzing Draft" message="AI is processing your project draft..." />,
            { duration: Infinity }
        );

        try {
            const res = await api.post("/projects/analyze-draft", {
                title,
                desc,
                requiredSkills: skillsRequired ? skillsRequired.split(",").map(s => s.trim()) : [],
                membersRequired: memberRequired,
            });
            toast.remove(toastId);
            setSuggestions(res.data);
            setShowAnalysisModal(true);
        } catch (err: any) {
            toast.remove(toastId);
            toast.custom(
                () => <CustomToast type="error" title="Analysis Failed" message={err.response?.data?.error || "Failed to analyze draft."} />,
                { duration: 2000 }
            );
        } finally {
            setAnalyzing(false);
        }
    };

    const applyAllSuggestions = () => {
        if (!suggestions) return;
        if (suggestions.suggestedTitle) setTitle(suggestions.suggestedTitle);
        if (suggestions.suggestedDesc) setDesc(suggestions.suggestedDesc);
        if (suggestions.suggestedSkills && suggestions.suggestedSkills.length > 0) {
            setSkillsRequired(suggestions.suggestedSkills.join(", "));
        }
        if (suggestions.suggestedMembers) setMembersRequired(suggestions.suggestedMembers);
        setShowAnalysisModal(false);
        toast.custom(
            () => <CustomToast type="success" title="Suggestions Applied" message="AI suggestions added to your form." />,
            { duration: 1500 }
        );
    };

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        const toastId = toast.custom(() => (
            <CustomToast type="info" title="Creating Project" message="Your Project is being created" />
        ), { duration: Infinity });

        try {
            const skillsArray = skillsRequired ? skillsRequired.split(",").map(s => s.trim()).filter(Boolean) : [];

            await api.post("/projects", {
                title,
                desc,
                requiredSkills: skillsArray,
                membersRequired: memberRequired,
                aiAnalysis: suggestions ? {
                    ...suggestions,
                    analyzedAt: new Date(),
                } : null,
            });

            toast.remove(toastId);
            toast.custom(() => (
                <CustomToast type="success" title="Project Created" message="Your project has been created successfully" />
            ), { duration: 1500 });

            setTitle("");
            setDesc("");
            setSkillsRequired("");
            setMembersRequired(1);
            setSuggestions(null);
        } catch (err: any) {
            toast.remove(toastId);
            toast.custom(() => (
                <CustomToast type="error" title="Project Creation Failed" message={err.response?.data?.error || "Unable to create the project. Please try again."} />
            ), { duration: 1500 });
        }
    };

    return (
        <Layout>
            <BackButton />

            <div className="max-w-2xl mx-auto py-4 px-2">
                {/* Form Card */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-sky-700 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-700/60 pb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                                <Pencil className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Create Project</h1>
                                <p className="text-xs text-slate-400">Draft your project details and invite teammates.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAnalyzeDraft}
                            disabled={analyzing}
                            className="flex items-center gap-1.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer self-start sm:self-center shadow-sm"
                        >
                            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${analyzing ? 'animate-spin' : ''}`} />
                            <span>{analyzing ? 'Analyzing Draft...' : 'Analyze Draft with AI'}</span>
                        </button>
                    </div>

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-300 mb-1.5">Project Title</label>
                            <input
                                required
                                placeholder="Enter project title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[#0B0F17] border border-sky-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-300 mb-1.5">Project Description</label>
                            <textarea
                                rows={3}
                                placeholder="Describe your project goals, scope, and expected outcome..."
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full bg-[#0B0F17] border border-sky-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-300 mb-1.5">
                                Required Skills <span className="text-slate-500 font-normal">(Comma separated)</span>
                            </label>
                            <input
                                placeholder="React.js, Node.js, Python, OpenCV"
                                value={skillsRequired}
                                onChange={(e) => setSkillsRequired(e.target.value)}
                                className="w-full bg-[#0B0F17] border border-sky-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-300 mb-1.5">Number of Members Required</label>
                            <input
                                type="number"
                                min={1}
                                value={memberRequired}
                                onChange={(e) => setMembersRequired(Number(e.target.value))}
                                className="w-full bg-[#0B0F17] border border-sky-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-sm"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>Create Project</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* AI Review Suggestions Modal */}
            {showAnalysisModal && suggestions && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#131A29] border border-slate-700/80 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setShowAnalysisModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-purple-400" /> AI Project Analysis
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">
                            Review student-friendly recommendations generated by Gemini.
                        </p>

                        <div className="space-y-4 text-xs">
                            {/* Title Recommendation */}
                            <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-sky-700/50">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Suggested Title</span>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-slate-200 font-semibold">{suggestions.suggestedTitle}</p>
                                    <button
                                        type="button"
                                        onClick={() => setTitle(suggestions.suggestedTitle)}
                                        className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                                    >
                                        <span>Use Title</span> <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Description Recommendation */}
                            <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-sky-700/50">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Suggested Description</span>
                                <p className="text-slate-300 text-xs leading-relaxed mb-3">{suggestions.suggestedDesc}</p>
                                <button
                                    type="button"
                                    onClick={() => setDesc(suggestions.suggestedDesc)}
                                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Use Description</span> <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Skills & Roles Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-sky-700/50">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block">Recommended Skills</span>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {suggestions.suggestedSkills.map((s, idx) => (
                                            <span key={idx} className="bg-slate-800 border border-slate-700/60 text-sky-300 px-2.5 py-1 rounded-md text-xs font-medium">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSkillsRequired(suggestions.suggestedSkills.join(", "))}
                                        className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Use Skills</span> <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-sky-700/50">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block">Suggested Team Roles</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {suggestions.suggestedRoles.map((r, idx) => (
                                            <span key={idx} className="bg-purple-950/40 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-md text-xs font-medium">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowAnalysisModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition cursor-pointer"
                            >
                                Dismiss
                            </button>
                            <button
                                type="button"
                                onClick={applyAllSuggestions}
                                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                            >
                                <Check className="w-4 h-4" />
                                <span>Apply All Suggestions</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default CreateProject;