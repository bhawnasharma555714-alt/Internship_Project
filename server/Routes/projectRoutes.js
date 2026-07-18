import express from 'express';
import { createProject, getAllProjects, getProjectById, getMyCreatedProject , updateProject, deleteProject} from '../Controllers/ProjectController.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';

const router = express.Router();

//Get All Projects : http://localhost:3000/api/projects 
router.get('/',getAllProjects);

//getMyCreatedProject : http://locahost:3000/api/project/my
router.get('/my',verifyToken,getMyCreatedProject);

//Get Project By ID : http://localhost:3000/api/projects/:id 
router.get('/:id',getProjectById);

//create Project : http://localhost:3000/api/projects
router.post('/',verifyToken,createProject);

//Update project: http://localhost:3000/api/projects/:id
router.put('/:id',verifyToken,updateProject);

//Delete project http://localhost:3000/api/projects/:id
router.delete('/:id',verifyToken,deleteProject);
 

export default router;