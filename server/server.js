import dotenv from 'dotenv';
import express from 'express';
import connectDb from './db/db.js';
import cors from 'cors';
import http from "http";
import { Server } from "socket.io";
//Routes
import authRoutes from './Routes/authRoutes.js';
import projectRoutes from './Routes/projectRoutes.js';
import applcationRoutes from './Routes/applicationRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import messageRoutes from './Routes/messageRoutes.js';
import { setupSocket } from "./socket/socketHandler.js";
//Middlewares
import {middleware} from './Middlewares/middleware.js';
import githubSkillsRoutes from './Routes/githubSkillsRoutes.js';
import matchmakingRoutes from './Routes/matchmakingRoutes.js';

dotenv.config();
const port = process.env.PORT || 3000;
let app = express();
const server = http.createServer(app);
connectDb();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://collabconnect1.vercel.app"
    ],
    credentials: true,
}));

app.use(express.json()); //for raw json post
app.use(express.urlencoded({extended:false})); //for x-www-form-urlencoded
app.use(middleware);
app.use('/api/auth',authRoutes);
app.use('/api/projects',projectRoutes);
app.use('/api/applications',applcationRoutes);
app.use('/api/users',userRoutes);
app.use('/api/messages', messageRoutes);
// ... other middlewares and routes
app.use('/api/github-skills', githubSkillsRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.get("/", (req, res) => {
    res.send("Server is running!");
});

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://collabconnect1.vercel.app"],
        methods: ["GET", "POST"]
    }
});
setupSocket(io);
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
