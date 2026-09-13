import jwt from "jsonwebtoken";
import Project from "../Models/projectModel.js";
import Application from "../Models/applicationModel.js";
import Message from "../Models/messageModel.js";

export const setupSocket = (io) => {
  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) {
      return next(new Error("Not authorized: Token missing"));
    }

    try {
      // Strip "Bearer " prefix if sent in token header
      const cleanToken = token.startsWith("Bearer ")
        ? token.slice(7)
        : token;

      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      next(new Error("Invalid or expired token"));
    }
  });

  // Socket Event Handlers
  io.on("connection", (socket) => {
    const userId = String(socket.user.id || socket.user._id);
    console.log(`User connected: ${socket.id} (User ID: ${userId})`);

    // Event: Join Project Room
    socket.on("joinProject", async (projectId) => {
      try {
        if (!projectId) {
          return socket.emit("joinError", "Project ID is required");
        }

        const project = await Project.findById(projectId);
        if (!project) {
          return socket.emit("joinError", "Project not found");
        }

        // Check if user is creator
        const creatorId = String(project.creator);
        const isCreator = creatorId === userId;

        // Check if user is an accepted team member
        const acceptedApplication = await Application.findOne({
          applicant: userId,
          project: projectId,
          status: "accepted",
        });

        if (!isCreator && !acceptedApplication) {
          return socket.emit(
            "joinError",
            "You are not allowed to join this project chat"
          );
        }

        const room = `project_${projectId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} successfully joined ${room}`);
        socket.emit("joinedSuccess", { projectId, room });
      } catch (error) {
        console.error("Error joining project room:", error);
        socket.emit("joinError", "Something went wrong while joining chat");
      }
    });

    // Event: Send & Save Message
    socket.on("sendMessage", async ({ projectId, message }) => {
      if (!projectId) {
        return socket.emit("messageError", "Missing Project ID");
      }

      if (!message || !message.trim()) {
        return socket.emit("messageError", "Message cannot be empty");
      }

      const room = `project_${projectId}`;

      try {
        // Auto-rejoin room if socket disconnected and reconnected silently
        if (!socket.rooms.has(room)) {
          const project = await Project.findById(projectId);
          const isCreator = project && String(project.creator) === userId;
          const acceptedApp = await Application.findOne({
            applicant: userId,
            project: projectId,
            status: "accepted",
          });

          if (isCreator || acceptedApp) {
            socket.join(room);
          } else {
            return socket.emit(
              "messageError",
              "You are not authorized to send messages in this project"
            );
          }
        }

        // Save message to MongoDB
        const newMessage = await Message.create({
          project: projectId,
          sender: userId,
          message: message.trim(),
        });

        // Populate sender's name before broadcasting
        const populatedMessage = await newMessage.populate("sender", "name");

        console.log(`[Room: ${room}] New Message Broadcast from ${userId}`);

        // Broadcast to everyone in the room (including sender)
        io.to(room).emit("receiveMessage", populatedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("messageError", "Failed to send or save message");
      }
    });

    // Event: Disconnect
    socket.on("disconnect", (reason) => {
      console.log(`User disconnected (${socket.id}): ${reason}`);
    });
  });
};