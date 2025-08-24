const { admin } = require('../config/firebase');

// Verify Firebase token and get user info
const login = async (req, res) => {
  try {
    const { token } = req.body;

    // Validate input
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Firebase token is required'
      });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0],
      emailVerified: decodedToken.email_verified
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token or authentication failed'
    });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split('@')[0],
        emailVerified: decodedToken.email_verified
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Try to get user record from Firebase Auth
    const userRecord = await admin.auth().getUser(uid);
    
    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || userRecord.email?.split('@')[0],
        emailVerified: userRecord.emailVerified,
        photoURL: userRecord.photoURL,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

// Create user account (for admin use)
const createUser = async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });

    // Set custom claims for role-based access
    if (role) {
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: role });
    }

    res.json({
      success: true,
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    let errorMessage = 'Failed to create user';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Email already exists';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

// Reset password (send password reset email)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // In a real application, you would send this link via email
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      resetLink: resetLink // Remove this in production
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    let errorMessage = 'Failed to send password reset email';
    if (error.code === 'auth/user-not-found') {
      // Don't reveal if user exists or not for security
      errorMessage = 'If an account with that email exists, a password reset link has been sent.';
    }
    
    res.json({
      success: true,
      message: errorMessage
    });
  }
};

// Test login with email/password (for development/testing only)
const testLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Try to get user by email from Firebase Auth
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // In a real app, you'd verify password properly
      // This is just for testing API endpoints
      const user = {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || userRecord.email?.split('@')[0],
        emailVerified: userRecord.emailVerified
      };

      res.json({
        success: true,
        message: 'Test login successful',
        user: user,
        note: 'This is a test endpoint - password not actually verified'
      });

    } catch (userError) {
      if (userError.code === 'auth/user-not-found') {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      throw userError;
    }

  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Contact administrator
const contactAdmin = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // In a real application, you would send an email to administrators
    // For now, we'll just log it and return success
    console.log('Contact admin request:', { name, email, message });

    res.json({
      success: true,
      message: 'Your message has been sent to the administrator.'
    });

  } catch (error) {
    console.error('Contact admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user account (admin only)
const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await admin.auth().deleteUser(uid);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

module.exports = {
  login,
  verifyToken,
  getUserProfile,
  createUser,
  forgotPassword,
  contactAdmin,
  deleteUser,
  testLogin
};