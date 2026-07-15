import { useState , type SyntheticEvent} from "react";
import api from "../services/api";
function CreateProject(){
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [skillsRequired, setSkillsRequired] = useState("");
    const [memberRequired, setMembersRequired] = useState(1);
    const [message, setMessage] = useState("");

    const handleSubmit = async( e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        try{
            await api.post("/projects", {
                title,
                desc,
                skillsRequired: skillsRequired.split(","),
                memberRequired,
            });
            setMessage("Project created successfully!");
            setTitle("");
            setDesc("");
            setSkillsRequired("");
            setMembersRequired(1);
        }catch(err){
            setMessage("Failed to create Project");
        }
    };
    return(
        <div>
            <h1>Create Project</h1>
            <form onSubmit={handleSubmit}>
                <input
                    required
                    placeholder="Project Title"
                    value={title}
                    onChange={(e)=>setTitle(e.target.value)}
                />
                
                <textarea
                    placeholder="Project Description"
                    value={desc}
                    onChange={(e)=>setDesc(e.target.value)}
                />
                <input
                    placeholder="Skills in format [React.js, Node.js, Python]"
                    value={skillsRequired}
                    onChange={(e)=>setSkillsRequired((e.target.value))}
                />
                <input
                    type="number"
                    value={memberRequired}
                    onChange={(e)=>setMembersRequired(Number(e.target.value))}
                />
                <button type="submit">Create</button>
                {message && <p>{message}</p>}
                

            </form>
        </div>
    );
}

export default CreateProject;