import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import Layout from "../Components/Layout";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import SkillGapSidebar from "../Components/SkillGapSidebar";

const Chat = () => {
    const { projectId } = useParams();
    const [chatError, setChatError] = useState("");
    const { user } = useAuth();
    let isAllowed = true;
    const navigate = useNavigate();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [projectTitle, setProjectTitle] = useState("Project Chat");

    useEffect(() => {
        if (!projectId) return;

        // Fetch project title
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
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log(response.data);
                setMessages(response.data);

            } catch (error: any) {
                console.error("Error Fetching messages:", error);

                setMessages([]);

                if (error.response?.status === 403) {
                    setChatError(error.response.data.error);
                    isAllowed = false;
                    console.log(isAllowed);
                }
            }
        };

        fetchMessages();
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        socket.on("joinError", (error) => {
            setChatError(error);
        });

        socket.emit("joinProject", projectId);

        return () => {
            socket.off("joinError");
        };
    }, [projectId]);

    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                message
            ]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim() || !projectId) return;

        socket.emit("sendMessage", {
            projectId,
            message: newMessage
        });

        setNewMessage("");
    };

    const handleDeleteMessage = async (messageId: string) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this message?"
        );

        if (!confirmDelete) {
            return;
        }
        try {
            await api.delete(`/messages/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setMessages((prev) =>
                prev.filter((message) => message.id !== messageId)
            );

        } catch (error: any) {
            console.error(
                "Error deleting message:",
                error.response?.data || error
            );
        }
    };

    return (
        <Layout>
            <div className="flex items-center mb-6">
                <ArrowLeft
                    className="text-slate-400 h-8 w-8 font-bold hover:text-slate-300 cursor-pointer"
                    onClick={() => navigate(`/projects/${projectId}`)}
                />

                <button
                    className="pl-2 font-semibold text-slate-400 text-2xl hover:text-slate-300 cursor-pointer"
                    onClick={() => navigate(`/projects/${projectId}`)}
                >
                    Back to Project
                </button>
            </div>

            {chatError ? (
                <div className="max-w-2xl mx-auto border-4 border-slate-700 mt-10 p-10 text-center rounded-2xl">
                    <h2 className="text-2xl font-bold text-white">
                        🔒 Chat Access Restricted
                    </h2>

                    <p className="text-slate-400 mt-4">
                        {chatError}
                    </p>

                    <button
                        onClick={() => navigate(`/projects/${projectId}`)}
                        className="mt-6 bg-sky-700 text-white font-medium px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors cursor-pointer"
                    >
                        Back to Project
                    </button>
                </div>
            ) : (
                /* Main Container: Chat on the Left, Skill Gap Sidebar on the Right */
                <div className="flex flex-col lg:flex-row gap-6 items-start max-w-7xl mx-auto">
                    
                    {/* Chat Box Container */}
                    <div className="flex-1 w-full border-4 border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)] bg-slate-900/40">

                        {/* Chat Header */}
                        <div className="bg-slate-800/70 px-6 py-5 border-b border-slate-700">
                            <h1 className="text-xl md:text-2xl font-bold text-white">
                                {projectTitle}
                            </h1>

                            <p className="text-slate-400 mt-1 text-sm">
                                Collaborate with your project members
                            </p>
                        </div>

                        {/* Messages Area */}
                        <div className="h-[480px] overflow-y-auto p-6 bg-slate-900/50 flex flex-col gap-3">

                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-500">
                                        No messages yet. Start the conversation!
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMyMessage =
                                        String(msg.sender?.id || msg.sender?._id) === String(user?.id);

                                    return (
                                        <div
                                            key={msg.id || msg._id}
                                            className={`flex ${
                                                isMyMessage
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-xl px-5 py-3 opacity-100 transition-opacity ${
                                                    isMyMessage
                                                        ? "bg-slate-800 border border-slate-800 text-white hover:opacity-80"
                                                        : "bg-slate-800 border border-slate-700 text-slate-300"
                                                }`}
                                            >

                                                {!isMyMessage && (
                                                    <strong className="text-sky-400 block mb-1">
                                                        {msg.sender?.name}
                                                    </strong>
                                                )}

                                                <div className="flex items-end gap-3">

                                                    <p className="break-words">
                                                        {msg.message}
                                                    </p>

                                                    <small
                                                        className={`text-xs whitespace-nowrap ${
                                                            isMyMessage
                                                                ? "text-sky-200"
                                                                : "text-slate-500"
                                                        }`}
                                                    >
                                                        {new Date(
                                                            msg.createdAt
                                                        ).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </small>

                                                    {isMyMessage && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteMessage(msg.id || msg._id)}
                                                            title="Delete message"
                                                            className="cursor-pointer"
                                                        >
                                                            <Trash2 size={14} className="text-red-500 hover:text-red-400" />
                                                        </button>
                                                    )}

                                                </div>

                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-slate-800/70 border-t border-slate-700 p-4 flex gap-3">

                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) =>
                                    setNewMessage(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        sendMessage();
                                    }
                                }}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 outline-none focus:border-sky-500 placeholder:text-slate-500"
                            />

                            <button
                                onClick={sendMessage}
                                className="bg-sky-700 text-white font-medium px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors cursor-pointer"
                            >
                                Send
                            </button>

                        </div>

                    </div>

                    {/* Skill Gap Analysis Sidebar */}
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