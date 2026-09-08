// Routes/matchmakingRoutes.js
import express from 'express';
import { getRecommendedProjects } from '../Controllers/matchmakingController.js';
import { verifyToken } from '../Middlewares/authMiddleWare.js';

const router = express.Router();

router.get('/recommendations', verifyToken, getRecommendedProjects);

export default router;