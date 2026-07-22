import ErrorImg from "../assets/error.png";
import Layout from "./Layout";

interface ErrorProps {
    error: string;
    className?:string
}

function Error({error,className}:ErrorProps){
    return(
        <Layout>
            <img src={ErrorImg} className={`mx-auto mt-6 ${className ?? ""}`}/>
            <p className="text-slate-400 mx-auto text-3xl font-semibold p-2 text-center">{error}</p>
        </Layout>
    )
}

export default Error;