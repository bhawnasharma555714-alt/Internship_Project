import Layout from "./Layout";
import { LoaderCircle } from "lucide-react";

function Loader(){
    return(
        <Layout>
            <div className="flex flex-row justify-center items-center mt-8">
                <LoaderCircle className="w-8 h-8 text-sky-500 animate-spin" style={{animationDuration: "3s"}}/>
                <p className="text-slate-300 pl-4 text-2xl font-semibold">Loading...</p>
            </div>
        </Layout>
    )
}

export default Loader;