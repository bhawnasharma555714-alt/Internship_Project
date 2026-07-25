import dotenv from 'dotenv';
import express from 'express';
import connectDb from './db/db.js';
import cors from 'cors';
//Routes
import authRoutes from './Routes/authRoutes.js';
import projectRoutes from './Routes/projectRoutes.js';
import applcationRoutes from './Routes/applicationRoutes.js';
import userRoutes from './Routes/userRoutes.js';
//Middlewares
import {middleware} from './Middlewares/middleware.js';
dotenv.config();
const port = process.env.PORT || 3000;
connectDb();
let app = express();
app.use(cors());
app.use(express.json()); //for raw json post
app.use(express.urlencoded({extended:false})); //for x-www-form-urlencoded
app.use(middleware);
app.use('/api/auth',authRoutes);
app.use('/api/projects',projectRoutes);
app.use('/api/applications',applcationRoutes);
app.use('/api/users',userRoutes);
app.get("/", (req, res) => {
    res.send("Server is running!");
});
app.listen(port, () => {
    console.log("Server running on port :",port);
});