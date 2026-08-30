import jwt from "jsonwebtoken";
import Project from "../Models/projectModel.js";
import Application from "../Models/applicationModel.js";
import Message from "../Models/messageModel.js";

export const setupSocket = (io) => {

    // Socket authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Not authorized"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error("Invalid or expired token"));
        }
    });

    // Socket events
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        // Join project room
        socket.on("joinProject", async (projectId) => {
            try {
                const project = await Project.findById(projectId);
                if (!project) {
                    return socket.emit("joinError", "Project not found");
                }
                // Check if user is the project creator
                const isCreator = project.creator.toString() === socket.user.id;
                // Check if user is an accepted applicant
                const acceptedApplication = await Application.findOne({
                    applicant: socket.user.id,
                    project: projectId,
                    status: "accepted"
                });
        
                if (!isCreator && !acceptedApplication) {
                    return socket.emit(
                        "joinError",
                        "You are not allowed to join this project chat"
                    );
                }
                const room = `project_${projectId}`;
                socket.join(room);
                console.log(`${socket.id} joined ${room}`);

            } catch (error) {
                console.error("Error joining project:", error);
                socket.emit("joinError", "Something went wrong");
            }
        });
        //Sending and saving message
        socket.on("sendMessage", async ({ projectId, message }) => {
            const room = `project_${projectId}`;
            if(!socket.rooms.has(room)) return socket.emit("messageError","You are not allowed to send Messages");
            if(!message.trim()){
                return socket.emit("messageError","Message cannot be empty");
            }
            try {
                const newMessage = await Message.create({
                    project: projectId,
                    sender: socket.user.id,
                    message: message
                });
                const populatedMessage = await newMessage.populate("sender","name");

                console.log("MESSAGE RECEIVED FROM CLIENT:", projectId, message);
                const room = `project_${projectId}`;
                io.to(room).emit("receiveMessage", populatedMessage);
                
            } catch (error) {
                console.error("Error sending message:", error);
            }
        });
        // Disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });

    });
};