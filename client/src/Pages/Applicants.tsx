import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { application } from "../types/application";
import type { project } from "../types/project";

function Application() {
    const { id } = useParams();

    const [project, setProject] = useState<project | null>(null);
    const [applications, setApplications] = useState<application[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [filter,setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

    useEffect(() => {
        getProjectApplications();
    }, [id]);

    const getProjectApplications = async () => {
        try {
            const res = await api.get(`/applications/${id}/applicants`);
            console.log(res.data);

            setProject(res.data.project);
            setApplications(res.data.applicants);
        } catch (err) {
            setError("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = filter === "all"? applications : applications.filter((application) => application.status === filter);
    const updateStatus = async (
        applicationId: string,
        status: "accepted" | "rejected"
    ) => {
        try {
            await api.patch(`/applications/${applicationId}`, {
                status,
            });

            // Update frontend without refreshing
            setApplications((prev) =>
                prev.map((application) =>
                    application.id === applicationId? { ...application, status }: application
                )
            );
        } catch (err:any) {
            setError(err.response.data.error);
        }
    };

    if (loading) return <h2>Loading...</h2>;
    if (error) return <h2>{error}</h2>;
    if (applications.length === 0)
        return <h2>No Applications for this project</h2>;

    return (
        <div>
            <h1>{project?.title}</h1>

            <button onClick={()=>setFilter("all")}>All</button>
            <button onClick={()=>setFilter("pending")}>Pending</button>
            <button onClick={()=>setFilter("accepted")}>Accepted</button>
            <button onClick={()=>setFilter("rejected")}>Rejected</button>

            {filteredApplications.map((application) => (
                <div key={application.id}>
                    <h3>Name: {application.applicant.name}</h3>
                    <p>Match Score: {application.aiMatchScore}</p>
                    <p> Strengths: {application.strengths.join(", ")}</p>
                    <p>Weak Areas: {application.weaknesses.join(", ")}</p>
                    <p>Bio: {application.applicant.bio}</p>
                    <p>Skills: {application.applicant.skills.join(", ")}</p>
                    <p>Status: {application.status}</p>
                    {application.status === "pending" && (
                        <>
                            <button onClick={() => updateStatus(application.id,"accepted")}>
                                Accept
                            </button>

                            <button onClick={() => updateStatus(application.id,"rejected")}>
                                Reject
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Application;