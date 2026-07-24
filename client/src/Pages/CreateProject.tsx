import { useState , type SyntheticEvent} from "react";
import api from "../services/api";
import Layout from "../Components/Layout";
import BackButton from "../Components/BackButton";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";
function CreateProject(){
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [skillsRequired, setSkillsRequired] = useState("");
    const [memberRequired, setMembersRequired] = useState(1);

    const handleSubmit = async( e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        const toastId = toast.custom(()=>(
          <CustomToast type="info" title="Creating Project" message="Your Project is being created"/>
        ),{duration:Infinity})
        try{
            await api.post("/projects", {
                title,
                desc,
                skillsRequired: skillsRequired.split(","),
                memberRequired,
            });
            toast.remove(toastId);
            toast.custom(()=>(
                <CustomToast type="success" title="Project Created" message="Your project has been created successfully"/>
                ),{duration:1500})
            setTitle("");
            setDesc("");
            setSkillsRequired("");
            setMembersRequired(1);
        }catch(err:any){
            toast.remove(toastId);
            toast.custom(()=>(
                <CustomToast type="error" title="Project Creation Failed" message={err.response?.data?.error || "Unable to create the project. Please try again."}/>
            ),{duration:1500})
        }
    };
    return (
        <Layout>
            <BackButton />

            <div className="flex justify-center mt-8 mb-10">
                <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-lg">
                    <div className="flex flex-row justify-center border-b border-slate-500 pb-2 my-2">
                        <Pencil className="w-8 h-8 text-sky-500 mt-1"/>
                        <h1 className="px-2 text-3xl font-bold text-white text-center mb-8">Create Project</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-6">
                        <div>
                            <label className="block text-slate-300 font-semibold mb-2 pr-4">Project Title</label>
                            <input required placeholder="Enter project title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-900  border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-slate-300 font-semibold mb-2">
                            Project Description
                            </label>
                            <textarea
                            rows={4}
                            placeholder="Describe your project..."
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-sky-600"
                            />
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block text-slate-300 font-semibold mb-2">Required Skills<span className="text-slate-400 text-sm font-medium mt-1 pl-4">(Separate skills using commas.)</span></label>
                            <input
                            placeholder="React.js, Node.js, Python"
                            value={skillsRequired}
                            onChange={(e) => setSkillsRequired(e.target.value)}
                            className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
                            />
                        </div>

                        {/* Members */}
                        <div>
                            <label className="block text-slate-300 font-semibold mb-2">
                            Number of Members Required
                            </label>
                            <input
                            type="number"
                            min={1}
                            value={memberRequired}
                            onChange={(e) => setMembersRequired(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-sky-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-fit self-center mt-4 bg-sky-700 hover:bg-sky-600 text-white font-semibold px-8 py-3 rounded-lg transition duration-200 hover:scale-105"
                        >
                            Create Project
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
        );
}

export default CreateProject;