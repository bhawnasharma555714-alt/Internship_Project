import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const SALT_ROUND = 10;
import User from '../Models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();
import { generateVerificationToken, hashToken } from '../utils/tokenUtils.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email.js';

const TOKEN_EXPIRY_MS = (Number(process.env.EMAIL_TOKEN_EXPIRY_MINUTES) || 60) * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = (Number(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 30) * 60 * 1000;

export const signup = async(req, res) => {
    try{
        const user = req.body;
        if(!user.name || !user.email || !user.password){
            return res.status(400).json({error:"Name, Email and Password are required"})
        }else{
            const existingUser = await User.findOne({ email: user.email})
            if(existingUser) return res.status(400).json({error:"Email already registered."})
            else {
                const hashedPwd = await bcrypt.hash(user.password, SALT_ROUND);
                const { rawToken, hashedToken } = generateVerificationToken();

                const newUser = await User.create({
                    name:user.name,
                    email:user.email,
                    password:hashedPwd,
                    isEmailVerified: false,
                    emailVerificationTokenHash: hashedToken,
                    emailVerificationTokenExpiry: new Date(Date.now() + TOKEN_EXPIRY_MS),
                });

                try {
                    await sendVerificationEmail(newUser.email, rawToken);
                } catch (mailErr) {
                    console.error("Failed to send verification email:", mailErr);
                    // User is still created; they can request a resend later.
                }

                res.status(201).json(newUser);
            }
        }
    }catch(err){
        res.status(500).json({error: "Server Error", e:err});
    }
}

export const login = async(req,res) => {
    try{
        const user = req.body;
        if(!user.email || !user.password){
            return res.status(400).json({error: "Email and Password are required!!"});
        }
        const existingUser = await User.findOne({email:user.email})
        if(!existingUser){
            return res.status(400).json({error: "Email not found."})
        }
        const isMatch = await bcrypt.compare(user.password, existingUser.password);
        if(!isMatch) return res.status(401).json({error: "Invalid Password"});

        if(!existingUser.isEmailVerified){
            return res.status(403).json({error: "Please verify your email before logging in."});
        }

        const tokenUser = {id:existingUser._id, name:existingUser.name}
        const token = jwt.sign(
            tokenUser,
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        )
        res.json({token: token, user:existingUser})
    }catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
}

export const verifyEmail = async(req, res) => {
    try {
        const { token } = req.body;
        if(!token){
            return res.status(400).json({error: "Verification token is required."});
        }

        const hashedToken = hashToken(token);
        const user = await User.findOne({ emailVerificationTokenHash: hashedToken });

        if(!user){
            return res.status(400).json({error: "Invalid or already used verification link."});
        }

        if(user.emailVerificationTokenExpiry < new Date()){
            return res.status(400).json({error: "This verification link has expired.", expired: true});
        }

        user.isEmailVerified = true;
        user.emailVerificationTokenHash = null;
        user.emailVerificationTokenExpiry = null;
        await user.save();

        res.status(200).json({message: "Email verified successfully. You can now log in."});
    } catch(err){
        console.error(err);
        res.status(500).json({error: "Server Error"});
    }
}

export const resendVerification = async(req, res) => {
    try {
        const { email } = req.body;
        if(!email){
            return res.status(400).json({error: "Email is required."});
        }

        const user = await User.findOne({ email });

        // Always respond with the same generic message so we don't leak
        // whether an email is registered or already verified.
        const genericResponse = {message: "If an account with that email exists and is unverified, a new verification link has been sent."};

        if(!user || user.isEmailVerified){
            return res.status(200).json(genericResponse);
        }

        const { rawToken, hashedToken } = generateVerificationToken();
        user.emailVerificationTokenHash = hashedToken;
        user.emailVerificationTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_MS);
        await user.save();

        try {
            await sendVerificationEmail(user.email, rawToken);
        } catch (mailErr) {
            console.error("Failed to resend verification email:", mailErr);
        }

        res.status(200).json(genericResponse);
    } catch(err){
        console.error(err);
        res.status(500).json({error: "Server Error"});
    }
}

export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;
        if(!email){
            return res.status(400).json({error: "Email is required."});
        }

        const user = await User.findOne({ email });

        // Always return the same message so we don't leak which emails exist.
        const genericResponse = {message: "If an account with that email exists, a password reset link has been sent."};

        if(!user){
            return res.status(200).json(genericResponse);
        }

        const { rawToken, hashedToken } = generateVerificationToken();
        user.resetPasswordTokenHash = hashedToken;
        user.resetPasswordTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
        await user.save();

        try {
            await sendResetPasswordEmail(user.email, rawToken);
        } catch (mailErr) {
            console.error("Failed to send reset password email:", mailErr);
        }

        res.status(200).json(genericResponse);
    } catch(err){
        console.error(err);
        res.status(500).json({error: "Server Error"});
    }
}

export const resetPassword = async(req, res) => {
    try {
        const { token, newPassword } = req.body;
        if(!token || !newPassword){
            return res.status(400).json({error: "Token and new password are required."});
        }

        const hashedToken = hashToken(token);
        const user = await User.findOne({ resetPasswordTokenHash: hashedToken });

        if(!user){
            return res.status(400).json({error: "Invalid or already used reset link."});
        }

        if(user.resetPasswordTokenExpiry < new Date()){
            return res.status(400).json({error: "This reset link has expired.", expired: true});
        }

        user.password = await bcrypt.hash(newPassword, SALT_ROUND);
        user.resetPasswordTokenHash = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();

        res.status(200).json({message: "Password reset successfully. You can now log in with your new password."});
    } catch(err){
        console.error(err);
        res.status(500).json({error: "Server Error"});
    }
}