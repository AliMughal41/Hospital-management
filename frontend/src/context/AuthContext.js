import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInUser, signOutUser, resetPassword, onAuthStateChange } from '../firebase/auth';
import { createUserProfile, getUserProfile, updateUserProfile, getRecord } from '../firebase/database';
import { setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 AuthProvider initializing...');
    
    // Set Firebase to persist auth in session storage
    setPersistence(auth, browserSessionPersistence);
    
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        console.log('✅ User is authenticated:', firebaseUser.email);
        
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        };
        
        setUser(userData);
        
        // Load or create user profile
        try {
          const profileResult = await getUserProfile(firebaseUser.uid);
          if (profileResult.success) {
            console.log('📋 User profile loaded:', profileResult.data);
            setUserProfile(profileResult.data);
          } else {
            console.log('👤 Creating new user profile...');
            
            // Check if user exists in staff database to determine role
            let role = 'admin'; // default role
            let staffData = null;
            
            try {
              const staffResult = await getRecord('staff');
              
              if (staffResult.success && staffResult.data) {
                // Find staff member by email
                const staffArray = Object.keys(staffResult.data).map(key => ({
                  id: key,
                  ...staffResult.data[key]
                }));
                
                staffData = staffArray.find(staff => 
                  staff.contact?.email === firebaseUser.email ||
                  staff.email === firebaseUser.email
                );
                
                if (staffData) {
                  if (staffData.category === 'doctor') {
                    role = 'doctor';
                  } else if (staffData.category === 'admin') {
                    role = 'admin';
                  } else if (staffData.category === 'technician') {
                    role = 'technician';
                  } else if (staffData.category === 'receptionist') {
                    role = 'receptionist';
                  }
                }
              }
            } catch (staffError) {
              console.log('⚠️ Could not load staff data:', staffError);
            }
            
            const basicProfile = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || staffData?.name || firebaseUser.email.split('@')[0],
              role: role,
              status: 'active',
              staffId: staffData?.staffId || null,
              department: staffData?.department || null,
              category: staffData?.category || null,
              shiftStart: staffData?.shiftStart || null,
              shiftEnd: staffData?.shiftEnd || null,
              workingDays: staffData?.workingDays || []
            };
            
            await createUserProfile(firebaseUser.uid, basicProfile);
            setUserProfile(basicProfile);
            console.log('✅ User profile created:', basicProfile);
          }
          
          setIsAuthenticated(true);
          
        } catch (error) {
          console.error('❌ Error handling user profile:', error);
          
          // Fallback to basic profile
          const basicProfile = {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: 'admin',
            status: 'active'
          };
          setUserProfile(basicProfile);
          setIsAuthenticated(true);
        }
      } else {
        console.log('🚪 User not authenticated');
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    });
    
    return () => {
      console.log('🔄 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    console.log('🔐 Attempting login for:', email);
    setLoading(true);
    
    try {
      const result = await signInUser(email, password);
      
      if (result.success) {
        console.log('✅ Login successful');
        // The auth state change listener will handle setting the user state
        return result;
      } else {
        console.log('❌ Login failed:', result.message);
        return result;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: 'Login failed due to an unexpected error'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out...');
    const result = await signOutUser();
    
    if (result.success) {
      setIsAuthenticated(false);
      setUser(null);
      setUserProfile(null);
      console.log('✅ Logout successful');
    }
    
    return result;
  };

  const forgotPassword = async (email) => {
    console.log('🔑 Sending password reset for:', email);
    return await resetPassword(email);
  };

  const updateProfile = async (updates) => {
    if (!user?.uid) {
      return { success: false, message: 'User not authenticated' };
    }
    
    const result = await updateUserProfile(user.uid, updates);
    if (result.success) {
      setUserProfile(prev => ({ ...prev, ...updates }));
    }
    return result;
  };

  const refreshProfile = async () => {
    if (!user?.uid) return;
    
    const profileResult = await getUserProfile(user.uid);
    if (profileResult.success) {
      setUserProfile(profileResult.data);
    }
  };

  const value = {
    isAuthenticated,
    user,
    userProfile,
    loading,
    login,
    logout,
    forgotPassword,
    updateProfile,
    refreshProfile
  };

  console.log('🎯 AuthProvider state:', { 
    isAuthenticated, 
    userEmail: user?.email, 
    userRole: userProfile?.role, 
    loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}