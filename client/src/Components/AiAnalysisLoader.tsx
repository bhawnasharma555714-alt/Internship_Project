import { Bot, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

interface AIAnalysisLoaderProps {
    state: "loading" | "success" | "error";
    message: string;
    onClose: () => void;
    onRetry: () => void;
}

function AIAnalysisLoader({
    state,
    message,
    onClose,
    onRetry
}: AIAnalysisLoaderProps) {

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center">

                    <div className="flex items-center gap-3">
                        <Bot className="text-sky-500" size={28} />
                        <div>
                            <h2 className="text-white text-lg font-semibold">CollabConnect AI</h2>
                            <p className="text-slate-400 text-sm">AI powered application analysis</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
                </div>

                {state === "loading" && (
                    <>
                        <div className="flex justify-center mt-8">
                            <Loader2 size={55} className="animate-spin text-sky-500"/>
                        </div>

                        <p className="text-center text-white mt-6 text-lg">{message}</p>
                        <p className="text-center text-slate-400 mt-3">This usually takes a few seconds.</p>
                    </>

                )}

                {state === "success" && (
                    <div className="text-center mt-8">
                        <CheckCircle2 size={60} className="text-green-500 mx-auto"/>
                        <p className="text-white text-xl mt-4">Analysis Complete</p>
                    </div>

                )}

                {state === "error" && (
                    <div className="text-center mt-8">
                        <AlertCircle size={60} className="text-red-500 mx-auto"/>
                        <p className="text-white text-xl mt-4">AI Analysis Failed</p>
                        <p className="text-slate-400 mt-3">{message}</p>

                        <div className="flex justify-center gap-4 mt-6">
                            <button onClick={onRetry} className="bg-sky-700 hover:bg-sky-600 px-5 py-2 rounded-lg text-white">Try Again</button>
                            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg text-white">Close</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default AIAnalysisLoader;