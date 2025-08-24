const { admin } = require('../config/firebase');

// Firebase authentication middleware
function authenticateJwt(req, res, next) {
	try {
		const authHeader = req.headers.authorization || '';
		const token = authHeader.replace('Bearer ', '');
		
		if (!token) {
			return res.status(401).json({ 
				success: false, 
				message: 'Unauthorized: No token provided' 
			});
		}

		// Verify Firebase ID token
		admin.auth().verifyIdToken(token)
			.then((decodedToken) => {
				req.user = {
					uid: decodedToken.uid,
					email: decodedToken.email,
					name: decodedToken.name || decodedToken.email?.split('@')[0],
					emailVerified: decodedToken.email_verified
				};
				next();
			})
			.catch((error) => {
				console.error('Token verification failed:', error);
				return res.status(401).json({ 
					success: false, 
					message: 'Unauthorized: Invalid token' 
				});
			});

	} catch (error) {
		console.error('Auth middleware error:', error);
		return res.status(401).json({ 
			success: false, 
			message: 'Unauthorized: Authentication failed' 
		});
	}
}

module.exports = { authenticateJwt };


