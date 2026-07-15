import api from "../services/api";
import { useState, useEffect } from "react";
import type{application } from "../types/application";

function MyApplications(){
    const [applications,setApplications] = useState<application[]>([]);
    const [error,setError] = useState("");
    const [loading,setLoading] = useState(true);
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
    if(loading) return <h1>Loading...</h1>
    if(applications.length === 0) return <h1>No applied Projects</h1>
    return(
        <div>
            <h1>My Applications</h1>
            {error && <p>{error}</p>}
            {applications.map((application)=>(
                <div key={application.id}>
                    <h2>{application.project.title}</h2>
                    <h2>{application.aiMatchScore}</h2>
                    <p>Strenghts : {application.strengths.join(", ")}</p>
                    <p>Weak Areas : {application.weaknesses.join(", ")}</p>
                    <p>Status : {application.status}</p>
                </div>
            ))}

        </div>
    );
}

export default MyApplications;

//applicants , not found, update profile remaining...