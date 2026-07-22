import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function BackButton() {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <div className="pl-4 mt-1 mb-4 text-slate-400 flex flex-row">
                <ArrowLeft className="w-8 h-8"/>
                <h3 className="text-2xl pl-2 font-medium">Go Back</h3>
            </div>
        </button>
    );
}

export default BackButton;