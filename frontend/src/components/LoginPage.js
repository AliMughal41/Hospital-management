import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import './LoginPage.css';

function LoginPage() {
  // All hooks must be called at the top level, before any conditional returns
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [message, setMessage] = useState('');

  const { login, forgotPassword, isAuthenticated, loading } = useAuth();
  const { hospitalName } = useHospital();
  const navigate = useNavigate();

  // useEffect must be called before any conditional returns
  useEffect(() => {
    console.log('🖥️ LoginPage auth state check:', { isAuthenticated, loading });
    if (isAuthenticated && !loading) {
      console.log('✅ User authenticated, navigating to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Show loading if auth is still initializing
  if (loading) {
    return (
      <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#64748b' }}>Initializing...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    console.log('🔐 Submitting login form...');
    const result = await login(formData.email, formData.password);
    
    console.log('📊 Login result:', result);
    
    if (result.success) {
      console.log('✅ Login successful, will navigate via useEffect');
      setMessage('Login successful! Redirecting...');
      // Don't navigate here - let useEffect handle it after auth state is set
    } else {
      console.log('❌ Login failed:', result.message);
      setMessage(result.message);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotEmail) {
      setMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(forgotEmail);
    setMessage(result.message);
    setIsLoading(false);
    
    if (result.success) {
      setShowForgotPassword(false);
      setForgotEmail('');
    }
  };



  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="logo">{hospitalName}</h1>
          <h2 className="welcome-title">Welcome back</h2>
          <p className="welcome-subtitle">Sign in to your account to continue</p>
        </div>

        {message && (
          <div className={`message ${message.includes('successful') || message.includes('sent') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 18.68 16.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="forgot-password-link">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="link-button"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="signin-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="form-group">
              <label htmlFor="forgot-email">Email</label>
              <div className="input-container">
                <input
                  type="email"
                  id="forgot-email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="signin-button"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="link-button back-to-login"
              disabled={isLoading}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {!showForgotPassword && (
          <div className="signup-link">
            <span>Don't have an account? </span>
            <span className="contact-admin-text">Please contact your administrator for account creation.</span>
          </div>
        )}

        <div className="footer">
          <p>© 2023 {hospitalName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
