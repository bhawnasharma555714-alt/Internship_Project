import express from 'express';
import { signup, login, verifyEmail, resendVerification, forgotPassword, resetPassword } from '../Controllers/authController.js';
import { githubLogin, githubCallback, githubLinkStart } from '../Controllers/githubAuthController.js';
// Routes/authRoutes.js
import { googleLogin, googleCallback } from '../Controllers/googleAuthController.js';
import { verifyToken } from '../Middlewares/authMiddleWare.js';

const router = express.Router();

router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post("/signup",signup);
router.post("/login",login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);
router.get('/github/link', verifyToken, githubLinkStart);

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

export default router;