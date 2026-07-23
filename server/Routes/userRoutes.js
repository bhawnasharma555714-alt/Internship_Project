import express from 'express';
import { getProfile, updateProfile } from '../Controllers/userController.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';

const router = express.Router();

//Get My Profile : http://localhost:3000/api/users/profile
router.get('/profile',verifyToken, getProfile);

//Update My Profile: http://locahost:3000/api/users/profile
router.patch('/profile',verifyToken,updateProfile);


export default router;