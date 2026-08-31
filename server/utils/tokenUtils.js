import crypto from "crypto";

// Generates a random raw token (sent to user) and its SHA-256 hash (stored in DB)
export const generateVerificationToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    return { rawToken, hashedToken };
};

export const hashToken = (rawToken) => {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
};