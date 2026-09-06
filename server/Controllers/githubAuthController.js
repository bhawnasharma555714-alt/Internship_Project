import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const BACKEND_URL = (process.env.BACKEND_URL || "").replace(/\/$/, "");
const FRONTEND_URL = (process.env.FRONTEND_URL || "").replace(/\/$/, "");

// ---- Existing login flow (unchanged) ----
export const githubLogin = (req, res) => {
    const redirectUri = `${BACKEND_URL}/api/auth/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email repo`;
    res.redirect(githubAuthUrl);
};

// ---- New: link flow, requires an already-authenticated user ----
export const githubLinkStart = (req, res) => {
    const state = jwt.sign(
        { userId: req.user.id, purpose: "github-link" },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
    );
    const redirectUri = `${BACKEND_URL}/api/auth/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email repo&state=${encodeURIComponent(state)}`;
    res.status(200).json({ url: githubAuthUrl });
};

// ---- Shared helper: exchange code for token + fetch GitHub profile/email ----
async function exchangeCodeForProfile(code) {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: `${BACKEND_URL}/api/auth/github/callback`,
        }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
        throw new Error("GitHub token exchange failed: " + JSON.stringify(tokenData));
    }
    const accessToken = tokenData.access_token;

    const profileRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();

    let email = profile.email;
    if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const emails = await emailsRes.json();
        const primary = Array.isArray(emails) ? emails.find(e => e.primary && e.verified) : null;
        email = primary?.email || null;
    }

    return { accessToken, profile, email };
}

function issueTokenAndRedirect(res, user) {
    const tokenUser = { id: user._id, name: user.name };
    const token = jwt.sign(tokenUser, process.env.JWT_SECRET, { expiresIn: "7d" });
    const userPayload = encodeURIComponent(JSON.stringify(user.toJSON()));
    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}&user=${userPayload}`);
}

// ---- Callback: mode-aware (login vs link) ----
export const githubCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code) {
            return res.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
        }

        const { accessToken, profile, email } = await exchangeCodeForProfile(code);

        if (!email) {
            const errTarget = state ? `${FRONTEND_URL}/profile?linkError=no_github_email` : `${FRONTEND_URL}/login?error=no_github_email`;
            return res.redirect(errTarget);
        }

        // ---- LINK MODE ----
        if (state) {
            let decoded;
            try {
                decoded = jwt.verify(state, process.env.JWT_SECRET);
            } catch (err) {
                return res.redirect(`${FRONTEND_URL}/profile?linkError=invalid_or_expired_state`);
            }
            if (decoded.purpose !== "github-link") {
                return res.redirect(`${FRONTEND_URL}/profile?linkError=invalid_state`);
            }

            // Safety check: is this GitHub account already linked to a DIFFERENT user?
            const existingLink = await User.findOne({ githubId: String(profile.id) });
            if (existingLink && String(existingLink._id) !== decoded.userId) {
                return res.redirect(`${FRONTEND_URL}/profile?linkError=already_linked_elsewhere`);
            }

            const currentUser = await User.findById(decoded.userId);
            if (!currentUser) {
                return res.redirect(`${FRONTEND_URL}/profile?linkError=user_not_found`);
            }

            currentUser.githubId = String(profile.id);
            currentUser.githubUsername = profile.login;
            currentUser.githubAccessToken = accessToken;
            await currentUser.save();

            return res.redirect(`${FRONTEND_URL}/profile?linked=true`);
        }

        // ---- LOGIN MODE (existing behavior, unchanged) ----
        let user = await User.findOne({ githubId: String(profile.id) });

        if (user) {
            user.githubAccessToken = accessToken;
            await user.save();
            return issueTokenAndRedirect(res, user);
        }

        user = await User.findOne({ email });

        if (user) {
            user.githubId = String(profile.id);
            user.githubUsername = profile.login;
            user.githubAccessToken = accessToken;
            if (!user.isEmailVerified) user.isEmailVerified = true;
            await user.save();
            return issueTokenAndRedirect(res, user);
        }

        user = await User.create({
            name: profile.name || profile.login,
            email: email,
            githubId: String(profile.id),
            githubUsername: profile.login,
            githubAccessToken: accessToken,
            isEmailVerified: true,
        });

        return issueTokenAndRedirect(res, user);

    } catch (err) {
        console.error("GitHub OAuth error:", err);
        const target = req.query.state ? `${FRONTEND_URL}/profile?linkError=server_error` : `${FRONTEND_URL}/login?error=server_error`;
        return res.redirect(target);
    }
};