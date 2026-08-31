import express from 'express';
import { signup, login, verifyEmail, resendVerification, forgotPassword, resetPassword } from '../Controllers/authController.js';

const router = express.Router();

router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post("/signup",signup);
router.post("/login",login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;