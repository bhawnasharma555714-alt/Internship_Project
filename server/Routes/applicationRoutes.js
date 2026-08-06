import express from 'express';
import { applyProject,getMyApplications, getProjectApplicants, deleteApplication, updateApplicationStatus,analyzeApplication, removeCollaborator } from "../Controllers/applicationController.js";
import { verifyToken } from '../Middlewares/authMiddleware.js';
const router = express.Router();

//here :id is project's id==========================================================
//Apply Project : http://localhost:3000/api/applications/:id/apply
router.post('/:id/apply',verifyToken,applyProject);

//Get My Projects : http://localhost:3000/api/applications/my
router.get('/my',verifyToken,getMyApplications);

//Get Project Applicants: http://localhost:3000/api/applications/:id/applicants
router.get('/:id/applicants',verifyToken,getProjectApplicants);

//here id is application id;
//DELETE req ;  http://localhost:3000/api/applications/:id
router.delete('/:id',verifyToken, deleteApplication);

//Patch req-: changing status of application :  http://localhost:3000/api/applications/:id
router.patch("/:id", verifyToken, updateApplicationStatus);

//Analyze application using AI-: http://localhost:3000/api/application/:id/analyze
router.patch("/:id/analyze", verifyToken, analyzeApplication);

//Remove Collaborator - http://localhost:3000/api/application/:id/remove
router.patch("/:id/remove",verifyToken, removeCollaborator);

export default router;
