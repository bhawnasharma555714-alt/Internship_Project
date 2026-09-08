// Routes/matchmakingRoutes.js
import express from 'express';
import { getRecommendedProjects } from '../Controllers/matchmakingController.js';
import { protect } from '../Middleware/authMiddleWare.js'; // JWT Protection

const router = express.Router();

// Protected: Only authenticated users can access recommendations
router.get('/recommendations', protect, getRecommendedProjects);

export default router;