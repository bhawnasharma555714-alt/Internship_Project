import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (toEmail, rawToken) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

    await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: "Verify your CollabConnect email",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                <h2>Welcome to CollabConnect!</h2>
                <p>Please verify your email address to activate your account.</p>
                <p>
                    <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;">
                        Verify Email
                    </a>
                </p>
                <p>Or copy this link into your browser:</p>
                <p style="word-break:break-all;">${verifyUrl}</p>
                <p>This link expires in ${process.env.EMAIL_TOKEN_EXPIRY_MINUTES || 60} minutes.</p>
                <p>If you didn't create this account, you can ignore this email.</p>
            </div>
        `,
    });
};

export const sendResetPasswordEmail = async (toEmail, rawToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    console.log("Attempting to send via Resend to:", toEmail);
    console.log("Using API key present?", !!process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: "Reset your CollabConnect password",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your CollabConnect password.</p>
                <p>
                    <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;">
                        Reset Password
                    </a>
                </p>
                <p>Or copy this link into your browser:</p>
                <p style="word-break:break-all;">${resetUrl}</p>
                <p>This link expires in ${process.env.RESET_TOKEN_EXPIRY_MINUTES || 30} minutes.</p>
                <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
            </div>
        `,
    });

    console.log("Resend result:", result);
};