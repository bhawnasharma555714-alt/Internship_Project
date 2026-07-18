import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

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
        <div>
            <h1>Edit Project</h1>

            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                />

                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Project Description"
                />

                <input
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    placeholder="React, Node, MongoDB"
                />

                <input
                    type="number"
                    value={membersRequired}
                    onChange={(e) =>
                        setMembersRequired(Number(e.target.value))
                    }
                />

                <button type="submit">
                    Update Project
                </button>
            </form>
        </div>
    );
}

export default EditProject;