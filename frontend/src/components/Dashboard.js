import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import { useNavigate } from 'react-router-dom';
import { 
  getTotalPatients,
  getTotalAppointments,
  getTotalLabTests,
  getTotalBloodBankUnits
} from '../firebase/database';
import Patients from './Patients';
import Appointments from './Appointments';
import LabTests from './LabTests';
import BloodBank from './BloodBank';
import Staff from './Staff';
import Accounts from './Accounts';
import Settings from './Settings';
import './Dashboard.css';

function Dashboard() {
  const { user, userProfile, logout } = useAuth();
  const { hospitalName } = useHospital();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    patients: 0,
    appointments: 0,
    labTests: 0,
    bloodBank: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    loadDashboardData();

    // Set up realtime subscriptions so counts auto-update
    const unsubscribers = [];
    try {
      const { subscribeToRecord } = require('../firebase/database');
      unsubscribers.push(subscribeToRecord('patients', () => loadDashboardData()));
      unsubscribers.push(subscribeToRecord('appointments', () => loadDashboardData()));
      unsubscribers.push(subscribeToRecord('labTests', () => loadDashboardData()));
      unsubscribers.push(subscribeToRecord('bloodBank', () => loadDashboardData()));
    } catch (e) {
      // ignore if subscribe not available
    }
    return () => {
      unsubscribers.forEach((unsub) => typeof unsub === 'function' && unsub());
    };
  }, [user?.uid]);

  useEffect(() => {
    if (currentPage === 'dashboard' && user?.uid) {
      loadDashboardData();
    }
  }, [currentPage, user?.uid]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Loading dashboard data from Firebase...');
      // Load real data from Firebase for all dashboard statistics
      const [patientsResult, appointmentsResult, labTestsResult, bloodBankResult] = await Promise.all([
        getTotalPatients(),
        getTotalAppointments(),
        getTotalLabTests(),
        getTotalBloodBankUnits()
      ]);
      
      console.log('Dashboard data results:', {
        patients: patientsResult,
        appointments: appointmentsResult,
        labTests: labTestsResult,
        bloodBank: bloodBankResult
      });
      
      setDashboardStats({
        patients: patientsResult.success ? patientsResult.count : 0,
        appointments: appointmentsResult.success ? appointmentsResult.count : 0,
        labTests: labTestsResult.success ? labTestsResult.count : 0,
        bloodBank: bloodBankResult.success ? bloodBankResult.count : 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values if there's an error
      setDashboardStats({
        patients: 0,
        appointments: 0,
        labTests: 0,
        bloodBank: 0
      });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (pageId) => {
    if (pageId === 'settings') {
      navigate('/settings');
    } else {
      setCurrentPage(pageId);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'patients', label: 'Patients', icon: 'patients' },
    { id: 'appointments', label: 'Appointments', icon: 'appointments' },
    { id: 'labtests', label: 'Lab Tests', icon: 'labtests' },
    { id: 'bloodbank', label: 'Blood Bank', icon: 'bloodbank' },
    { id: 'staff', label: 'Staff', icon: 'staff', category: 'management' },
    { id: 'accounts', label: 'Accounts', icon: 'accounts', category: 'management' },
    { id: 'settings', label: 'Settings', icon: 'settings', category: 'management' }
  ];

  const renderIcon = (iconType) => {
    const iconProps = { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
    
    switch (iconType) {
      case 'dashboard':
        return (
          <svg {...iconProps}>
            <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'patients':
        return (
          <svg {...iconProps}>
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'appointments':
        return (
          <svg {...iconProps}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'labtests':
        return (
          <svg {...iconProps}>
            <path d="M9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 14C7 17.866 9.58172 21 12.7502 21C15.9187 21 18.5004 17.866 18.5004 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'bloodbank':
        return (
          <svg {...iconProps}>
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'staff':
        return (
          <svg {...iconProps}>
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21V19C23 18.1353 22.7473 17.318 22.2999 16.6405C21.8525 15.9631 21.2408 15.4589 20.5371 15.1995" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13C16.7033 3.38949 17.3145 3.89371 17.7618 4.57098C18.2091 5.24826 18.4618 6.06536 18.4618 6.92984C18.4618 7.79432 18.2091 8.61142 17.7618 9.2887C17.3145 9.96597 16.7033 10.4702 16 10.7297" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'accounts':
        return (
          <svg {...iconProps}>
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 5H9.5C7.01472 5 5 7.01472 5 9.5C5 11.9853 7.01472 14 9.5 14H14.5C16.9853 14 19 16.0147 19 18.5C19 20.9853 16.9853 23 14.5 23H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="17" y1="1" x2="17" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="7" y1="19" x2="7" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'settings':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5842 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6642 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6642 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">{hospitalName || 'MediSyncX'}</h1>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.filter(item => !item.category).map((item) => (
              <li key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className="nav-link"
                >
                  {renderIcon(item.icon)}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          
          <div className="nav-section">
            <h3 className="nav-section-title">MANAGEMENT</h3>
            <ul className="nav-list">
              {navigationItems.filter(item => item.category === 'management').map((item) => (
                <li key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className="nav-link"
                  >
                    {renderIcon(item.icon)}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {currentPage === 'dashboard' && (
          <>
            <div className="content-header">
              <h1 className="page-title">Dashboard Overview</h1>
              <div className="user-info-header">
                <span>Welcome, {userProfile?.displayName || user?.displayName || user?.email}</span>
                <button 
                  className="refresh-btn"
                  onClick={loadDashboardData}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
              </div>
            </div>

            <div className="dashboard-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon patients-icon">
                    {renderIcon('patients')}
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">PATIENTS</div>
                    <div className="stat-number">{dashboardStats.patients}</div>
                    <div className="stat-description">Total active patients</div>
                    <button 
                      className="stat-action"
                      onClick={() => handleNavigation('patients')}
                    >
                      View All
                    </button>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon appointments-icon">
                    {renderIcon('appointments')}
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">APPOINTMENTS</div>
                    <div className="stat-number">{dashboardStats.appointments}</div>
                    <div className="stat-description">Scheduled appointments</div>
                    <button 
                      className="stat-action"
                      onClick={() => handleNavigation('appointments')}
                    >
                      Manage
                    </button>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon labtests-icon">
                    {renderIcon('labtests')}
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">LAB TESTS</div>
                    <div className="stat-number">{dashboardStats.labTests}</div>
                    <div className="stat-description">Total lab tests</div>
                    <button 
                      className="stat-action"
                      onClick={() => handleNavigation('labtests')}
                    >
                      Review
                    </button>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon bloodbank-icon">
                    {renderIcon('bloodbank')}
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">BLOOD BANK</div>
                    <div className="stat-number">{dashboardStats.bloodBank}</div>
                    <div className="stat-description">Blood units available</div>
                    <button 
                      className="stat-action"
                      onClick={() => handleNavigation('bloodbank')}
                    >
                      Check Stock
                    </button>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="loading-message">
                  Loading dashboard data...
                </div>
              )}
            </div>
          </>
        )}

        {currentPage === 'patients' && <Patients />}
        {currentPage === 'appointments' && <Appointments />}
        {currentPage === 'labtests' && <LabTests />}
        {currentPage === 'bloodbank' && <BloodBank />}
        {currentPage === 'staff' && <Staff />}
        {currentPage === 'accounts' && <Accounts />}
        {currentPage === 'settings' && <Settings />}
        
        {currentPage !== 'dashboard' && currentPage !== 'patients' && currentPage !== 'appointments' && currentPage !== 'labtests' && currentPage !== 'bloodbank' && currentPage !== 'staff' && currentPage !== 'accounts' && currentPage !== 'settings' && (
          <div className="coming-soon">
            <div className="content-header">
              <h1 className="page-title">{navigationItems.find(item => item.id === currentPage)?.label || 'Page'}</h1>
            </div>
            <div className="coming-soon-content">
              <h2>Coming Soon</h2>
              <p>This page is under development and will be available soon.</p>
              <button 
                className="back-to-dashboard-btn"
                onClick={() => handleNavigation('dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
