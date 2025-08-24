import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import LabTests from './LabTests';
import Accounts from './Accounts';
import './Dashboard.css';

function TechnicianDashboard() {
  const { user, userProfile, logout } = useAuth();
  const { hospitalName } = useHospital();
  const [currentPage, setCurrentPage] = useState('labtests');

  const navigationItems = [
    { id: 'labtests', label: 'Today Lab Tests', icon: 'labtests' },
    { id: 'accounts', label: 'My Salary', icon: 'accounts' }
  ];

  const renderIcon = (iconType) => {
    const iconProps = { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
    switch (iconType) {
      case 'labtests':
        return (
          <svg {...iconProps}>
            <path d="M9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 14C7 17.866 9.58172 21 12.7502 21C15.9187 21 18.5004 17.866 18.5004 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">{hospitalName || 'MediSyncX'}</h1>
          <div className="role-badge">Technician</div>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.map((item) => (
              <li key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`}>
                <button onClick={() => setCurrentPage(item.id)} className="nav-link">
                  {renderIcon(item.icon)}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
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
      <div className="main-content">
        <div className="content-header">
          <h1 className="page-title">Technician Workspace</h1>
          <div className="user-info-header">
            <span>Welcome, {userProfile?.displayName || user?.email}</span>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon labtests-icon">
                {renderIcon('labtests')}
              </div>
              <div className="stat-content">
                <div className="stat-label">Shift</div>
                <div className="stat-number">{(userProfile?.shiftStart || 'N/A') + ' - ' + (userProfile?.shiftEnd || 'N/A')}</div>
                <div className="stat-description">Working Days: {(userProfile?.workingDays || []).join(', ') || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {currentPage === 'labtests' && <LabTests />}
        {currentPage === 'accounts' && <Accounts />}
      </div>
    </div>
  );
}

export default TechnicianDashboard;


