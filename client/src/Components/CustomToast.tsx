import { XCircle,LoaderCircle, CheckCircle } from 'lucide-react';

interface CustomToastProps {
    title: string;
    message: string;
    type: "success" | "error" | "info";
}
function CustomToast({title,message,type,}:CustomToastProps){
    const styles = {
        success: {
            icon: <CheckCircle size={28} className='text-green-400'/>,
            border: "border-green-500",
            bg: "bg-green-500/10",
        },
        error:{
            icon: <XCircle size={28} className='text-red-400'/>,
            border:"border-red-500",
            bg:"bg-red-500/10"
        },
        info:{
            icon: <LoaderCircle size={28} className='text-sky-400 animate-spin' style={{animationDuration: "3s"}}/>,
            border: "border-sky-500",
            bg: "bg-sky-500/10",
        },
    }
    const current = styles[type];
    return(
        <div className={`w-96 rounded-2xl border ${current.border} bg-slate-900 shadow-2xl overflow-hidden`}>
            <div className={`flex gap-4 items-center p-4 ${current.bg}`}>
                {current.icon}
                 <div>
                    <h3 className="text-white font-semibold">{title}</h3>
                    <p className="text-slate-300 text-sm mt-1">{message}</p>
                </div>
            </div>
        </div>
    );

}
export default CustomToast;
