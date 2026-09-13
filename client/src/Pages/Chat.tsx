import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import Layout from "../Components/Layout";
import { ArrowLeft, Trash2, Send } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import SkillGapSidebar from "../Components/SkillGapSidebar";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";

const Chat = () => {
    const { projectId } = useParams();
    const [chatError, setChatError] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [projectTitle, setProjectTitle] = useState("Project Chat");

    useEffect(() => {
        if (!projectId) return;

        const fetchProjectDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await api.get(`/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const projectData = res.data.project || res.data;
                if (projectData?.title) {
                    setProjectTitle(projectData.title);
                }
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;

        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get(`/messages/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(response.data);
            } catch (error: any) {
                console.error("Error Fetching messages:", error);
                setMessages([]);
                if (error.response?.status === 403) {
                    setChatError(error.response.data.error || "Access restricted");
                }
            }
        };

        fetchMessages();
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit("joinProject", projectId);

        const handleJoinError = (error: string) => {
            setChatError(error);
        };

        const handleMessageError = (error: string) => {
            toast.custom(
                () => <CustomToast type="error" title="Message Error" message={error} />,
                { duration: 2000 }
            );
        };

        const handleReceiveMessage = (message: any) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        socket.on("joinError", handleJoinError);
        socket.on("messageError", handleMessageError);
        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("joinError", handleJoinError);
            socket.off("messageError", handleMessageError);
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [projectId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim() || !projectId) return;

        socket.emit("sendMessage", {
            projectId,
            message: newMessage.trim()
        });

        setNewMessage("");
    };

    const handleDeleteMessage = async (messageId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this message?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/messages/${messageId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setMessages((prev) => prev.filter((msg) => (msg.id || msg._id) !== messageId));
        } catch (error: any) {
            console.error("Error deleting message:", error.response?.data || error);
        }
    };

    return (
        <Layout>
            <div className="flex items-center mb-4 sm:mb-6">
                <ArrowLeft
                    className="text-slate-400 h-6 w-6 font-bold hover:text-slate-200 cursor-pointer"
                    onClick={() => navigate(`/projects/${projectId}`)}
                />
                <button
                    className="pl-2 font-semibold text-slate-300 text-base sm:text-lg hover:text-white cursor-pointer"
                    onClick={() => navigate(`/projects/${projectId}`)}
                >
                    Back to Project
                </button>
            </div>

            {chatError ? (
                <div className="max-w-xl mx-auto border border-sky-700 bg-slate-900/60 backdrop-blur-md mt-6 sm:mt-10 p-6 sm:p-8 text-center rounded-2xl shadow-xl">
                    <h2 className="text-lg sm:text-xl font-bold text-white">🔒 Chat Access Restricted</h2>
                    <p className="text-slate-400 text-xs mt-3">{chatError}</p>
                    <button
                        onClick={() => navigate(`/projects/${projectId}`)}
                        className="mt-6 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                    >
                        Back to Project
                    </button>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 items-start max-w-7xl mx-auto">
                    {/* Chat Box Container */}
                    <div className="flex-1 w-full border border-sky-700 rounded-2xl overflow-hidden shadow-xl bg-slate-900/60 backdrop-blur-md">
                        {/* Chat Header */}
                        <div className="bg-slate-900/80 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-sky-700/60 flex items-center justify-between">
                            <div>
                                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate max-w-[260px] sm:max-w-none">
                                    {projectTitle}
                                </h1>
                                <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">Real-time team chatroom</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="h-[400px] sm:h-[460px] overflow-y-auto p-3 sm:p-6 bg-slate-950/40 flex flex-col gap-2.5 sm:gap-3">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-500 text-xs">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const currentUserId = String(user?.id || (user as any)?._id);
                                    const senderId = String(msg.sender?.id || msg.sender?._id || msg.sender);
                                    const isMyMessage = senderId === currentUserId;

                                    return (
                                        <div
                                            key={msg.id || msg._id}
                                            className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs ${
                                                    isMyMessage
                                                        ? "bg-sky-600 text-white"
                                                        : "bg-slate-800 border border-slate-700/80 text-slate-200"
                                                }`}
                                            >
                                                {!isMyMessage && (
                                                    <strong className="text-sky-400 block text-[11px] mb-1">
                                                        {msg.sender?.name || "Teammate"}
                                                    </strong>
                                                )}

                                                <div className="flex items-end justify-between gap-2.5 sm:gap-3">
                                                    <p className="break-words leading-relaxed">{msg.message}</p>
                                                    <div className="flex items-center gap-1 shrink-0 ml-1.5">
                                                        <small className={`text-[10px] ${isMyMessage ? "text-sky-200" : "text-slate-400"}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </small>
                                                        {isMyMessage && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteMessage(msg.id || msg._id)}
                                                                title="Delete message"
                                                                className="cursor-pointer text-rose-300 hover:text-rose-100 transition ml-0.5"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Bar */}
                        <div className="bg-slate-900/90 border-t border-sky-700/60 p-2.5 sm:p-3.5 flex items-center gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendMessage();
                                }}
                                placeholder="Type a message..."
                                className="flex-1 bg-[#0B0F17] border border-sky-700/80 text-white rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs outline-none focus:ring-2 focus:ring-sky-500/80 placeholder:text-slate-500 min-w-0"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                            >
                                <span className="hidden sm:inline">Send</span>
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    {projectId && (
                        <div className="w-full lg:w-80 shrink-0">
                            <SkillGapSidebar projectId={projectId} />
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
};

export default Chat;