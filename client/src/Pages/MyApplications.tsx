import api from "../services/api";
import { useState, useEffect } from "react";
import type{application } from "../types/application";
import Layout from "../Components/Layout";
import Error from "../Components/Error";
import Loader from "../Components/Loader";
import { Search } from "lucide-react";

function MyApplications(){
    const [applications,setApplications] = useState<application[]>([]);
    const [error,setError] = useState("");
    const [loading,setLoading] = useState(true);
    const [search,setSearch] = useState("");
    useEffect(()=>{
        getMyApplications();
    },[])

    const getMyApplications = async() => {
        try{
            const res = await api.get('/applications/my');
            setApplications(res.data);
        }catch(err:unknown){
            setError("Failed to fetch your applications");
        }finally{
            setLoading(false);
        }
    }
    const deleteApplication = async(id:string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this Application?");
        if(!confirmDelete) return;
        try{
            await api.delete(`/applications/${id}`);
            setApplications((prev) => prev.filter((application)=>application.id !== id));
        }catch(err){
            alert('Failed to delete Application');
        }
    }

    const displayedApplications = (search.trim() === "" ) ? applications : applications.filter((application)=>
        application.project.title.toLowerCase().includes(search.toLowerCase())
    );
    if(loading) return <Loader/>
    if(error) return <Error className="h-80 w-80" error={error}/>

    if(applications.length === 0){
        return(
            <Layout>
                <h1 className="text-4xl md:text-5xl font-semibold text-white text-center">My Applications</h1>
                <p className="mt-4 text-xl text-slate-400 text-center">Track all your submitted applications</p>

                <div className="text-center mt-24">
                    <h2 className="text-3xl text-slate-400">No Applications Yet</h2>
                    <p className="text-slate-500 mt-3 text-lg">Apply to projects and they'll appear here.</p>
                </div>
            </Layout>
        );
    }

    return(
        <Layout>
            <h1 className="text-4xl md:text-5xl font-medium text-white text-center">My Applications</h1>
            <p className="mt-4 text-xl text-slate-400 text-center">Track all your submitted applications</p>
            <p className="text-white text-center p-4">{applications.length} application{applications.length !== 1 && "s"}</p>
            <div className="flex justify-center mt-8">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 w-5 h-5"/>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Application..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
                </div>
            </div>

            {displayedApplications.map((application)=>(
                <div key={application.id} className="max-w-3xl mx-auto border-4 border-slate-700 mt-10 p-10 rounded-2xl hover:border-slate-600 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)] transition-all duration-300">

                    <h2 className="text-4xl font-bold text-white">{application.project.title}</h2>

                    <div className="mt-6">
                        <div className="flex">
                            <p className="text-slate-400 font-medium pr-2 py-1">AI Match Score</p>
                            <span className="inline-block px-5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">{application.aiMatchScore}%</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-white font-semibold mb-3">Strengths</h3>

                        <div className="flex flex-wrap gap-3">
                            {application.strengths.map((item,index)=>(
                                <span
                                    key={index}
                                    className="bg-emerald-900/40 text-emerald-300 px-4 py-2 rounded-full">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Areas to Improve</h3>

                        <div className="flex flex-wrap gap-3">
                            {application.weaknesses.map((weakness,index)=>(
                                <span key={`${weakness}-${index}`} className="bg-red-500/20 text-red-400 px-5 py-2 rounded-full font-medium transition-all duration-200 hover:-translate-y-1 hover:scale-110 cursor-pointer">{weakness}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row justify-between items-center">

                        <div className="flex flex-col md:flex-row items-center">
                            <p className="text-slate-400 font-medium py-2 pr-2">Application Status : </p>
                            <span className={`inline-block mt-2 px-5 py-2 rounded-full font-semibold ${
                                application.status === "accepted"
                                ? "bg-green-500/20 text-green-400"
                                : application.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}>
                                {application.status.charAt(0).toUpperCase()+application.status.slice(1)}
                            </span>
                        </div>

                        <button onClick={()=>deleteApplication(application.id)} className="mt-6 md:mt-0 px-8 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-200">
                            Delete Application
                        </button>

                    </div>

                </div>
            ))}

        </Layout>
    );
}

export default MyApplications;

