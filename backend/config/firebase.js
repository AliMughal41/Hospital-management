const admin = require("firebase-admin");
const path = require("path");

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    // Import service account key JSON
    const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://medisyncx25-default-rtdb.firebaseio.com",
      storageBucket: "medisyncx25.firebasestorage.app"
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    console.log('📋 Make sure serviceAccountKey.json exists in backend/config/ directory');
    
    // Create a mock Firebase app for development without crashing
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('🔧 Running without Firebase Admin SDK - some features may not work');
    }
  }
} else {
  console.log('ℹ️  Firebase Admin already initialized');
}

// Export for use in routes/controllers
let db, auth, bucket;

try {
  db = admin.database();
  auth = admin.auth();
  bucket = admin.storage().bucket();
} catch (error) {
  console.log('⚠️  Firebase services not available:', error.message);
  // Create mock objects to prevent crashes
  db = { ref: () => ({ set: () => Promise.resolve(), get: () => Promise.resolve() }) };
  auth = { verifyIdToken: () => Promise.reject(new Error('Firebase not configured')) };
  bucket = null;
}

module.exports = { admin, db, auth, bucket };
