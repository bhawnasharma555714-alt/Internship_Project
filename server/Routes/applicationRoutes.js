import express from 'express';
import { applyProject,getMyApplications, getProjectApplicants } from "../Controllers/applicationController.js";
import { verifyToken } from '../Middlewares/authMiddleware.js';
const router = express.Router();

//Apply Project : http://localhost:3000/api/applications/:id/apply
router.post('/:id/apply',verifyToken,applyProject);

//Get My Projects : http://localhost:3000/api/applications/my
router.get('/my',verifyToken,getMyApplications);

//Get Project Applicants: http://localhost:3000/api/applications/:id/applicants
router.get('/:id/applicants',verifyToken,getProjectApplicants);

//here :id is project's id
export default router;
