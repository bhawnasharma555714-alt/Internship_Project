import { useState, type SyntheticEvent } from "react";
import api from "../services/api";
import Layout from "../Components/Layout";
import BackButton from "../Components/BackButton";
import { Pencil, Sparkles, Check, X, ArrowRight } from "lucide-react";
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
                // Persist AI analysis output in MongoDB
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

            <div className="flex justify-center mt-8 mb-10">
                <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-500 pb-3 mb-6 gap-4">
                        <div className="flex flex-row items-center">
                            <Pencil className="w-7 h-7 text-sky-500 mr-2" />
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Create Project</h1>
                        </div>

                        <button
                            type="button"
                            onClick={handleAnalyzeDraft}
                            disabled={analyzing}
                            className="flex items-center gap-2 bg-purple-900/60 border border-purple-500/50 hover:bg-purple-800/80 text-purple-200 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                            <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin text-purple-400' : ''}`} />
                            <span>{analyzing ? 'Analyzing Draft...' : 'Analyze Draft with AI'}</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label className="block text-slate-300 font-semibold mb-2 pr-4">Project Title</label>
                            <input required placeholder="Enter project title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600" />
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-2">Project Description</label>
                            <textarea rows={3} placeholder="Describe your project..." value={desc} onChange={(e) => setDesc(e.target.value)}
                                className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-sky-600" />
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-2">Required Skills<span className="text-slate-400 text-sm font-medium mt-1 pl-4">(Separate skills using commas.)</span></label>
                            <input placeholder="React.js, Node.js, Python" value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)}
                                className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600" />
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-2">Number of Members Required</label>
                            <input type="number" min={1} value={memberRequired} onChange={(e) => setMembersRequired(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600" />
                        </div>

                        <button type="submit" className="w-fit self-center mt-4 bg-sky-700 hover:bg-sky-600 text-white font-semibold px-8 py-3 rounded-lg transition duration-200 hover:scale-105 cursor-pointer">Create Project</button>
                    </form>
                </div>
            </div>

            {/* AI Review Suggestions Modal */}
            {showAnalysisModal && suggestions && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#131A29] border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setShowAnalysisModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-purple-400" /> AI Project Analysis
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">
                            Review student-friendly recommendations generated by Gemini.
                        </p>

                        <div className="space-y-4 text-sm">
                            <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800">
                                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase">Suggested Title</p>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-slate-200 font-medium">{suggestions.suggestedTitle}</p>
                                    <button
                                        type="button"
                                        onClick={() => setTitle(suggestions.suggestedTitle)}
                                        className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Use Title</span> <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800">
                                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase">Suggested Description</p>
                                <p className="text-slate-300 text-xs leading-relaxed mb-3">{suggestions.suggestedDesc}</p>
                                <button
                                    type="button"
                                    onClick={() => setDesc(suggestions.suggestedDesc)}
                                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Use Description</span> <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">Recommended Skills</p>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {suggestions.suggestedSkills.map((s, idx) => (
                                            <span key={idx} className="bg-sky-950 text-sky-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSkillsRequired(suggestions.suggestedSkills.join(", "))}
                                        className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer mt-1"
                                    >
                                        <span>Use Skills</span> <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">Suggested Team Roles</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {suggestions.suggestedRoles.map((r, idx) => (
                                            <span key={idx} className="bg-purple-950 text-purple-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowAnalysisModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 cursor-pointer"
                            >
                                Dismiss
                            </button>
                            <button
                                type="button"
                                onClick={applyAllSuggestions}
                                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer"
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