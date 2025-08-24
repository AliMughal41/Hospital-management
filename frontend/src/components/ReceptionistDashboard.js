import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import Patients from './Patients';
import Appointments from './Appointments';
import LabTests from './LabTests';
import BloodBank from './BloodBank';
import './Dashboard.css';

function ReceptionistDashboard() {
  const { user, userProfile, logout } = useAuth();
  const { hospitalName } = useHospital();
  const [currentPage, setCurrentPage] = useState('patients');

  const navigationItems = [
    { id: 'patients', label: 'Patients', icon: 'patients' },
    { id: 'appointments', label: 'Appointments', icon: 'appointments' },
    { id: 'labtests', label: 'Lab Tests', icon: 'labtests' },
    { id: 'bloodbank', label: 'Blood Bank', icon: 'bloodbank' }
  ];

  const renderIcon = (iconType) => {
    const iconProps = { width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' };
    switch (iconType) {
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
          <div className="role-badge">Receptionist</div>
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
          <h1 className="page-title">Reception Desk</h1>
          <div className="user-info-header">
            <span>Welcome, {userProfile?.displayName || user?.email}</span>
          </div>
        </div>

        {currentPage === 'patients' && <Patients />}
        {currentPage === 'appointments' && <Appointments />}
        {currentPage === 'labtests' && <LabTests />}
        {currentPage === 'bloodbank' && <BloodBank />}
      </div>
    </div>
  );
}

export default ReceptionistDashboard;


