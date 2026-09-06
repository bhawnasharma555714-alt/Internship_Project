import express from 'express';
import { getProjectMessages, deleteMessage } from '../Controllers/messageController.js';
import { verifyToken } from '../Middlewares/authMiddleWare.js'; 

const router = express.Router();

router.get("/:projectId", verifyToken, getProjectMessages);
router.delete("/:messageId", verifyToken, deleteMessage);
export default router;