import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import DoctorDashboard from './components/DoctorDashboard';
import Settings from './components/Settings';
import TechnicianDashboard from './components/TechnicianDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalProvider } from './context/HospitalContext';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('🛡️ ProtectedRoute check:', { isAuthenticated, loading });
  
  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Role-based Route Component
function RoleBasedRoute() {
  const { isAuthenticated, userProfile, loading } = useAuth();
  
  console.log('🎭 RoleBasedRoute check:', { isAuthenticated, userProfile, loading });
  
  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('👤 User role:', userProfile?.role);
  
  // Route based on user role
  if (userProfile?.role === 'doctor') {
    console.log('🏥 Rendering Doctor Dashboard');
    return <DoctorDashboard />;
  } else if (userProfile?.role === 'technician') {
    console.log('🧪 Rendering Technician Dashboard');
    return <TechnicianDashboard />;
  } else if (userProfile?.role === 'receptionist') {
    console.log('📝 Rendering Receptionist Dashboard');
    return <ReceptionistDashboard />;
  } else {
    console.log('👨‍💼 Rendering Admin Dashboard');
    // Default to admin dashboard for admin and other roles
    return <Dashboard />;
  }
}

function App() {
  return (
    <AuthProvider>
      <HospitalProvider>
        <Router>
          <div className="App">
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </HospitalProvider>
    </AuthProvider>
  );
}

export default App;
