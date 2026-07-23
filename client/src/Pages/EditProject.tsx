import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../Components/Layout";
import BackButton from "../Components/BackButton";
import { SquarePen } from "lucide-react";

function EditProject() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [requiredSkills, setRequiredSkills] = useState("");
    const [membersRequired, setMembersRequired] = useState<number>(1);
    const [message, setMessage] = useState("");

    useEffect(() => {
        getProject();
    }, []);

    const getProject = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            setTitle(res.data.title);
            setDesc(res.data.desc);
            setRequiredSkills(res.data.requiredSkills.join(", "));
            setMembersRequired(res.data.membersRequired);
        } catch {
            setMessage("Failed to load project");
        }
    };
    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        console.log(membersRequired);
       try {
            await api.put(`/projects/${id}`, {
                title,
                desc,
                requiredSkills: requiredSkills.split(",").map((s) => s.trim()),
                membersRequired,
            });
            navigate("/my-projects");
        } catch {
            setMessage("Failed to update project");
        }
    };


    return (
    <Layout>
        <BackButton />
        <div className="flex justify-center mt-8 mb-10 p-4">
            <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-lg">
                <div className="flex justify-center items-center border-b border-slate-500 mb-8 pb-8">
                    <SquarePen className="w-8 h-8 text-sky-500 mr-2" />
                    <h1 className="text-3xl font-bold text-white">Edit Project</h1>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-slate-300 font-semibold mb-2">Project Title</label>
                        <input
                            value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
                            className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
                    </div>
                    <div>
                        <label className="block text-slate-300 font-semibold mb-2">Project Description<span className="text-slate-400 text-sm font-medium pl-3">(Separate using commas.)</span></label>
                        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Project Description" 
                            className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
                    </div>
                    <div>
                        <label className="block text-slate-300 font-semibold mb-2">Required Skills</label>
                        <input value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="React, Node, MongoDB" 
                        className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
                    </div>
                    <div>
                        <label className="block text-slate-300 font-semibold mb-2">Number of Members Required</label>
                        <input type="number" value={membersRequired} onChange={(e) => setMembersRequired(Number(e.target.value)) } 
                        className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
                    </div>
                    <button type="submit" className="w-fit self-center mt-4 bg-sky-700 hover:bg-sky-600 text-white font-semibold px-8 py-3 rounded-lg transition duration-200 hover:scale-105"> Update Project </button>
                    {message && (<p className="text-center text-red-400 font-medium">{message}</p>)}
                </form>
            </div>
        </div>
    </Layout>
)
}

export default EditProject;