// Controllers/googleAuthController.js
import axios from 'axios';
import User from '../Models/userModel.js';
import jwt from 'jsonwebtoken';

// 1. Redirect user to Google OAuth consent screen
export const googleLogin = (req, res) => {
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
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
      return res.redirect(`${frontendUrl}/login?error=no_email_provided`);
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanGoogleId = String(googleId);

    // Find existing user by googleId or email
    let user = await User.findOne({ 
      $or: [{ googleId: cleanGoogleId }, { email: cleanEmail }] 
    });

    if (user) {
      // Link Google ID if the user registered with password previously
      if (!user.googleId) {
        user.googleId = cleanGoogleId;
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      // Create user using new User() instance to ensure googleId is set BEFORE password validation runs
      user = new User({
        googleId: cleanGoogleId,
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        isEmailVerified: true,
        profilePicture: picture || '',
        skills: [],
        interests: [],
        bio: '',
      });

      await user.save();
    }

    // Issue JWT token (Matches payload expected by auth middleware: { id: user._id })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Safely structure payload to pass via URL parameter
    const userPayload = encodeURIComponent(
      JSON.stringify(user.toJSON ? user.toJSON() : {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        skills: user.skills || [],
        interests: user.interests || [],
        githubId: user.githubId || null,
        githubUsername: user.githubUsername || null,
        googleId: user.googleId || null,
      })
    );

    return res.redirect(`${frontendUrl}/oauth-success?token=${token}&user=${userPayload}`);
  } catch (error) {
    // Extracts exact error message returned by Google API or Mongoose Validation
    const detailedError = 
      error.response?.data?.error_description || 
      error.response?.data?.error || 
      error.message;

    console.error('GOOGLE OAUTH DETAILED ERROR:', error.response?.data || error);

    // Redirects to frontend login page displaying the exact error message in the URL
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(detailedError)}`);
  }
};