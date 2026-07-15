import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import type { application } from "../types/application";
import type { project } from "../types/project";
import api from "../services/api";

function Applicants(){
    const {id} = useParams();
    const [project,setProject] = useState<project | null>(null);
    const [applicants,setApplicants] = useState<application[]>([]);
    const [error,setError] = useState("");
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        getProjectApplicants();
    },[id]);

    const getProjectApplicants = async() => {
        try{
            const res = await api.get(`/applications/${id}/applicants`);
            console.log(res.data);
            setApplicants(res.data.applicants);
            setProject(res.data.project);
        }catch(err:unknown){
            setError("Failed to fetch applicants");
        }finally{
            setLoading(false);
        }
    }
    if(loading) return <h2>Loading...</h2>;
    if (applicants.length === 0) return <h2>No Applicants for this project</h2>;
    return(
        <div>
            <h1>{project?.title}</h1>
            {error && <p>{error}</p>}
            <h2>Applicants</h2>
            {applicants.map((applicant)=>(
                <div key={applicant.id}>
                    <h3>Name : {applicant.applicant.name}</h3>
                    <p>Match Score : {applicant.aiMatchScore}</p>
                    <p>Strenghts : {applicant.strengths.join(", ")}</p>
                    <p>Weak Areas : {applicant.weaknesses.join(", ")}</p>
                    <p>Bio: {applicant.applicant.bio}</p>
                    <p>Skills: {applicant.applicant.skills.join(", ")}</p>
                </div>
            ))}

        </div>
    )
}
export default Applicants;