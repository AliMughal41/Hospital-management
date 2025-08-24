// src/firebase/auth.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail,
    onAuthStateChanged
  } from "firebase/auth";
  import { auth } from "./config";   // ✅ import from config.js
  
  export const createUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          emailVerified: userCredential.user.emailVerified
        },
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        message: error.message,
        code: error.code
      };
    }
  };
  
  export const signInUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          emailVerified: userCredential.user.emailVerified
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Sign in error:', error);
      let errorMessage = 'Login failed';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }
      
      return {
        success: false,
        message: errorMessage,
        code: error.code
      };
    }
  };
  
  export const signOutUser = async () => {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  };
  
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Password reset failed';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };