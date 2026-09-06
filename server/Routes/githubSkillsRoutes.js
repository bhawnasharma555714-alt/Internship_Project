// Routes/githubSkillsRoutes.js
import express from 'express';
import { verifyToken } from '../Middlewares/authMiddleWare.js';
import { analyzeGithubSkills, getGithubSkillProfile } from '../Controllers/githubSkillsController.js';

const router = express.Router();

router.get('/', verifyToken, getGithubSkillProfile);
router.get('/analyze', verifyToken, analyzeGithubSkills);

export default router;