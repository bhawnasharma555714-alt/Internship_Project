// Controllers/googleAuthController.js
import axios from 'axios';
import User from '../Models/userModel.js';
import jwt from 'jsonwebtoken';

// 1. Redirect user to Google OAuth consent screen
export const googleLogin = (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(googleAuthUrl);
};

// 2. Handle Google Callback
export const googleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
  }

  try {
    // Exchange auth code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    const { access_token } = tokenResponse.data;

    // Fetch user profile from Google
    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: googleId, email, name, picture } = profileResponse.data;

    if (!email) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth?error=no_email_provided`);
    }

    // Check if user already exists (by googleId or email)
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Auto-link googleId if account exists via email/password
      if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true; // Email verified by Google
        await user.save();
      }
    } else {
      // Create new user if not found
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        isEmailVerified: true,
        profilePicture: picture || '',
      });
    }

    // Issue standard JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Payload for existing frontend OAuthSuccess route
    const userPayload = encodeURIComponent(JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      githubId: user.githubId || null,
      githubUsername: user.githubUsername || null,
      googleId: user.googleId || null,
    }));

    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}&user=${userPayload}`);
  } catch (error) {
    console.error('Google Auth Error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_login_failed`);
  }
};