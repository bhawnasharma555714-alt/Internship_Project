import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { application } from "../types/application";
import type { project } from "../types/project";
import Layout from "../Components/Layout";
import Error from "../Components/Error";
import Loader from "../Components/Loader";
import BackButton from "../Components/BackButton";
import { ChevronDown, Search, Users,BicepsFlexed,TrendingDown } from "lucide-react";

function Application() {
    const { id } = useParams();
    const [project, setProject] = useState<project | null>(null);
    const [applications, setApplications] = useState<application[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [search,setSearch] = useState("");
    const [statusFilter,setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
    const [scoreFilter,setScoreFilter] = useState<"all" | "excellent" | "good" | "average" | "poor">("all");

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
        try {
            await api.patch(`/applications/${applicationId}`, {
                status,
            });

            setApplications((prev) =>
                prev.map((application) =>
                    application.id === applicationId? { ...application, status }: application
                )
            );
        } catch (err:any) {
            setError(err.response.data.error);
        }
    };
    const displayedApplications = applications
        .filter((application)=>
            application.applicant.name.toLowerCase().includes(search.toLowerCase())
        )
        .filter((application)=>{
            if(statusFilter === "all") return true;
            return application.status === statusFilter;
        })
        .filter((application)=>{
            const score = application.aiMatchScore ?? 0;

            if(scoreFilter === "all") return true;
            if(scoreFilter === "excellent")
                return score >= 70;

            if(scoreFilter === "good")
                return score >= 50 && score < 70;

            if(scoreFilter === "average")
                return score >= 30 && score < 50;

            return score < 30;
        })
        .sort((a,b)=>(b.aiMatchScore ?? 0)-(a.aiMatchScore ?? 0));

    if (loading) return <Loader/>;
    if (error) return <Error className="h-80 w-80" error={error}/>;

    return (
        <Layout>
            <BackButton/>
            <h2 className="text-3xl font-bold text-white py-2 text-center"><span className="font-bold text-slate-300 text-3xl">Project : </span>{project?.title}</h2>
            <p className="text-slate-400 py-1 text-center">Manage and review applicants for this project.</p>
            <div className="flex justify-center mt-6 mb-4">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 w-5 h-5"/>
                    <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search applicants..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
                </div>
            </div>

            <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center gap-2  mt-3">
                <div className="flex items-center gap-3">
                    <label className="text-white font-medium whitespace-nowrap">Status :</label>
                    <div className="relative">
                        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value as any)} className="appearance-none w-60 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-600">
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-white font-medium whitespace-nowrap">AI Match :</label>
                    <div className="relative">
                        <select value={scoreFilter} onChange={(e)=>setScoreFilter(e.target.value as any)} className="appearance-none w-60 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-600">
                            <option value="all">All</option>
                            <option value="excellent">Excellent Match (70-100%)</option>
                            <option value="good">Good Match (50-69%)</option>
                            <option value="average">Fair Match (30-49%)</option>
                            <option value="poor">Poor Match (0-29%)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                    </div>
                </div>
            </div>
            <div className="w-fit mx-auto mt-4 flex items-center gap-2">
                <Users className="text-sky-500"/>
                <p className="text-white text-center">{displayedApplications.length} applicant{displayedApplications.length !== 1 && "s"} found</p>
            </div>

            {displayedApplications.length === 0 ? (
                <div>
                    <h3 className="mt-4 text-slate-400 text-center text-3xl font-semibold">No Applications Found!!</h3>
                    <p className="text-slate-400 text-center mt-4">No one has applied to your project yet</p>
                </div>
            ) : ( displayedApplications.map((application) => (
                    <div key={application.id} className="max-w-3xl mx-auto border-4 border-slate-700 mt-10 p-10 rounded-2xl hover:border-slate-600 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)] transition-all duration-300">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                            <h2 className="text-3xl font-bold text-white">{application.applicant.name}</h2>
                            <p className="text-slate-500 font-medium mt-2">{application.applicant.bio || "No bio added."}</p>
                        </div>
                        <span className={`px-6 py-2 rounded-full font-semibold ${
                            (application.aiMatchScore ?? 0) >= 70
                            ? "bg-green-500/20 text-green-400"
                            : (application.aiMatchScore ?? 0) >= 50
                            ? "bg-sky-500/20 text-sky-400"
                            : (application.aiMatchScore ?? 0) >= 30
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                            }`}>
                            {application.aiMatchScore ?? 0}% Match
                        </span>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-white font-semibold mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-4">
                            {application.applicant.skills.map((skill,index)=>(
                                <span key={`${skill}-${index}`} className="bg-sky-100 text-sky-900 px-5 py-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 hover:scale-110 cursor-pointer">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="h-full">
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <div className="mt-6">
                                <div className="flex flex-row mb-1">
                                    <BicepsFlexed className="w-7 h-7 mt-2 text-emerald-500"/>
                                    <h3 className="text-slate-400 font-semibold text-xl pr-4 pl-2 py-2">Strengths</h3>
                                </div>

                                {application.strengths.length === 0 ? (
                                        <p className="text-slate-400 italic">
                                            AI analysis pending.
                                        </p>
                                    ) : (<div className="border-2 border-emerald-600 px-5 py-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                            <ul className="list-disc list-inside space-y-2 text-slate-300">
                                                {application.strengths.map((strength, index) => (
                                                    <li key={`${strength}-${index}`}>{strength}</li>
                                                ))}
                                            </ul>
                                        </div>)}
                            </div>
                            <div className="mt-6">
                                <div className="flex flex-row mb-1">
                                    <TrendingDown className="w-7 h-7 mt-2 text-amber-400"/>
                                    <p className="text-slate-400 font-semibold text-xl pr-4 pl-2 py-2">Areas to Improve</p>
                                </div>
                                {application.weaknesses.length === 0 ? (
                                        <p className="text-slate-400 italic">
                                            AI analysis pending.
                                        </p>
                                    ) : (<div className="border-2 border-amber-400 px-5 py-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                            <ul className="list-disc list-inside space-y-2 text-slate-300">
                                                {application.weaknesses.map((weakness, index) => (
                                                    <li key={`${weakness}-${index}`}>{weakness}</li>
                                                ))}
                                            </ul>
                                        </div>)}
                            </div>
                        </div>
                    </div>
                    <hr className="border-slate-600 my-8" />

                    <div className="mt-8 flex flex-col md:flex-row justify-between md:items-center gap-6">

                        <div className="flex items-center gap-3">
                        <p className="text-slate-400 font-medium">Status </p>

                        <span className={`px-5 py-2 rounded-full font-semibold ${
                            application.status === "accepted"
                            ? "bg-green-500/20 text-green-400"
                            : application.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                            {application.status.charAt(0).toUpperCase()+application.status.slice(1)}
                        </span>
                    </div>

                    {application.status === "pending" && (
                        <div className="flex items-center gap-3">
                            <button onClick={()=>updateStatus(application.id,"accepted")} className=" bg-green-700 text-white font-medium px-8 py-2.5 rounded-lg hover:bg-green-600 transition-colors">Accept</button>
                            <button onClick={()=>updateStatus(application.id,"rejected")} className="border border-red-500/40 text-red-400 font-medium px-8 py-2.5 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-500 transition-colors">Reject</button>
                        </div>
                    )}

                </div>

        </div>)))}
        </Layout>
    );
}

export default Application;