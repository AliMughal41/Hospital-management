import React, { useState, useEffect } from 'react';
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase/config';
import { createRecord, getRecord, updateRecord, deleteRecord } from '../firebase/database';
import { useHospital } from '../context/HospitalContext';
import './Settings.css';

function Settings() {
  const { hospitalName, updateHospitalName } = useHospital();
  const [activeTab, setActiveTab] = useState('general');
  const [hospitalInfo, setHospitalInfo] = useState({
    hospitalName: hospitalName,
    licenseNumber: 'MH-2023-45678',
    address: '123 Healthcare Avenue, Medical District',
    contactEmail: 'info@medicare-hospital.com',
    contactPhone: '+1 (555) 987-6543'
  });

  // Update local state when context changes
  useEffect(() => {
    setHospitalInfo(prev => ({
      ...prev,
      hospitalName: hospitalName
    }));
  }, [hospitalName]);

  // Security tab state
  const [securityForm, setSecurityForm] = useState({
    currentPasswordEmail: '',
    currentPasswordPass: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });

  // Department management state
  const [departments, setDepartments] = useState([]);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    headOfDepartment: '',
    contactEmail: '',
    contactPhone: '',
    status: 'Active'
  });
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentMessage, setDepartmentMessage] = useState({ type: '', text: '' });

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'departments', label: 'Departments' },
    { id: 'security', label: 'Security' }
  ];

  // Load departments when departments tab is active
  useEffect(() => {
    if (activeTab === 'departments') {
      loadDepartments();
    }
  }, [activeTab]);

  const loadDepartments = async () => {
    try {
      const result = await getRecord('departments');
      if (result.success && result.data) {
        const departmentsArray = Object.keys(result.data).map(key => ({
          id: key,
          ...result.data[key]
        }));
        setDepartments(departmentsArray);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setDepartmentLoading(true);
    setDepartmentMessage({ type: '', text: '' });

    try {
      const departmentData = {
        ...departmentForm,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = await createRecord('departments', departmentData);
      
      if (result.success) {
        setDepartmentMessage({ type: 'success', text: 'Department created successfully!' });
        setDepartmentForm({
          name: '',
          description: '',
          headOfDepartment: '',
          contactEmail: '',
          contactPhone: '',
          status: 'Active'
        });
        setShowAddDepartmentModal(false);
        loadDepartments(); // Refresh the departments list
      } else {
        setDepartmentMessage({ type: 'error', text: 'Failed to create department. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating department:', error);
      setDepartmentMessage({ type: 'error', text: 'Failed to create department. Please try again.' });
    } finally {
      setDepartmentLoading(false);
    }
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      name: department.name || '',
      description: department.description || '',
      headOfDepartment: department.headOfDepartment || '',
      contactEmail: department.contactEmail || '',
      contactPhone: department.contactPhone || '',
      status: department.status || 'Active'
    });
    setShowEditDepartmentModal(true);
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    setDepartmentLoading(true);
    setDepartmentMessage({ type: '', text: '' });

    try {
      const updates = {
        ...departmentForm,
        updatedAt: Date.now()
      };

      const result = await updateRecord(`departments/${editingDepartment.id}`, updates);
      
      if (result.success) {
        setDepartmentMessage({ type: 'success', text: 'Department updated successfully!' });
        setShowEditDepartmentModal(false);
        setEditingDepartment(null);
        loadDepartments(); // Refresh the departments list
      } else {
        setDepartmentMessage({ type: 'error', text: 'Failed to update department. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating department:', error);
      setDepartmentMessage({ type: 'error', text: 'Failed to update department. Please try again.' });
    } finally {
      setDepartmentLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        const result = await deleteRecord(`departments/${departmentId}`);
        if (result.success) {
          setDepartmentMessage({ type: 'success', text: 'Department deleted successfully!' });
          loadDepartments(); // Refresh the departments list
        } else {
          setDepartmentMessage({ type: 'error', text: 'Failed to delete department. Please try again.' });
        }
      } catch (error) {
        console.error('Error deleting department:', error);
        setDepartmentMessage({ type: 'error', text: 'Failed to delete department. Please try again.' });
      }
    }
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({
      name: '',
      description: '',
      headOfDepartment: '',
      contactEmail: '',
      contactPhone: '',
      status: 'Active'
    });
    setDepartmentMessage({ type: '', text: '' });
  };

  const handleInputChange = (field, value) => {
    setHospitalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityInputChange = (field, value) => {
    setSecurityForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any previous messages when user starts typing
    if (securityMessage.text) {
      setSecurityMessage({ type: '', text: '' });
    }
  };

  const handleSave = async () => {
    try {
      // Update hospital name in context (which will save to Firebase)
      const result = await updateHospitalName(hospitalInfo.hospitalName);
      
      if (result.success) {
        alert('Hospital information saved successfully!');
      } else {
        alert(`Failed to save hospital information: ${result.message}`);
      }
    } catch (error) {
      console.error('Error saving hospital information:', error);
      alert('Error saving hospital information. Please try again.');
    }
  };

  const handleEmailChange = async () => {
    if (!securityForm.newEmail || !securityForm.currentPasswordEmail) {
      setSecurityMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (securityForm.newEmail === auth.currentUser?.email) {
      setSecurityMessage({ type: 'error', text: 'New email must be different from current email.' });
      return;
    }

    setSecurityLoading(true);
    setSecurityMessage({ type: '', text: '' });

    try {
      // Re-authenticate user before changing email
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        securityForm.currentPasswordEmail
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update email
      await updateEmail(auth.currentUser, securityForm.newEmail);
      
      setSecurityMessage({ type: 'success', text: 'Email updated successfully!' });
      setSecurityForm(prev => ({ ...prev, newEmail: '', currentPasswordEmail: '' }));
    } catch (error) {
      console.error('Error updating email:', error);
      let errorMessage = 'Failed to update email.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use by another account.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      
      setSecurityMessage({ type: 'error', text: errorMessage });
    } finally {
      setSecurityLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 'none', text: '', color: '#9ca3af' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 1) return { strength: 'weak', text: 'Weak', color: '#ef4444' };
    if (score <= 3) return { strength: 'medium', text: 'Medium', color: '#f59e0b' };
    return { strength: 'strong', text: 'Strong', color: '#10b981' };
  };

  const handlePasswordChange = async () => {
    if (!securityForm.newPassword || !securityForm.confirmPassword || !securityForm.currentPasswordPass) {
      setSecurityMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (securityForm.newPassword.length < 6) {
      setSecurityMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setSecurityLoading(true);
    setSecurityMessage({ type: '', text: '' });

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        securityForm.currentPasswordPass
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, securityForm.newPassword);
      
      setSecurityMessage({ type: 'success', text: 'Password updated successfully!' });
      setSecurityForm(prev => ({ 
        ...prev, 
        newPassword: '', 
        confirmPassword: '', 
        currentPasswordPass: '' 
      }));
    } catch (error) {
      console.error('Error updating password:', error);
      let errorMessage = 'Failed to update password.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }
      
      setSecurityMessage({ type: 'error', text: errorMessage });
    } finally {
      setSecurityLoading(false);
    }
  };

  const renderGeneralTab = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3 className="section-title">Hospital Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="hospitalName">Hospital Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="hospitalName"
                value={hospitalInfo.hospitalName}
                onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                placeholder="Enter hospital name"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="licenseNumber">License Number</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="licenseNumber"
                value={hospitalInfo.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter license number"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="address">Address</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="address"
                value={hospitalInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter hospital address"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="contactEmail"
                value={hospitalInfo.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="Enter contact email"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contactPhone">Contact Phone</label>
            <div className="input-wrapper">
              <input
                type="tel"
                id="contactPhone"
                value={hospitalInfo.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Enter contact phone"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2136 21.3522 21.4019C21.1472 21.5901 20.9053 21.7335 20.6408 21.8227C20.3763 21.9119 20.0947 21.9451 19.813 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3146 6.72533 15.2661 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.19C2.09494 3.90847 2.12808 3.62693 2.21718 3.36243C2.30628 3.09793 2.44949 2.856 2.63765 2.65095C2.82581 2.4459 3.05465 2.28226 3.30967 2.17062C3.56469 2.05898 3.84019 2.00195 4.11859 2.00299H7.11859C7.5953 1.99522 8.06579 2.16708 8.43377 2.48353C8.80175 2.79999 9.04201 3.23945 9.10859 3.71C9.23662 4.68007 9.47147 5.62273 9.80859 6.53C9.93459 6.88792 9.9735 7.27675 9.92059 7.65C9.86768 8.02325 9.72507 8.36842 9.50859 8.65L8.10859 10.05C9.45864 12.0759 11.2241 13.8414 13.2496 15.1914L14.6496 13.7914C14.9312 13.5749 15.2763 13.4323 15.6496 13.3794C16.0229 13.3265 16.4117 13.3654 16.7696 13.4914C17.677 13.8285 18.6196 14.0634 19.5896 14.1914C20.0641 14.2586 20.508 14.5005 20.8264 14.8712C21.1448 15.2419 21.3162 15.7159 21.3086 16.1954L22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
          <button className="cancel-btn" onClick={() => setHospitalInfo({
            hospitalName: hospitalName,
            licenseNumber: 'MH-2023-45678',
            address: '123 Healthcare Avenue, Medical District',
            contactEmail: 'info@medicare-hospital.com',
            contactPhone: '+1 (555) 987-6543'
          })}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderDepartmentsTab = () => (
    <div className="settings-content">
      <div className="settings-section">
        <div className="section-header">
          <h3 className="section-title">Department Management</h3>
          <button
            className="add-user-btn"
            onClick={() => setShowAddDepartmentModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add New Department
          </button>
      </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Head of Department</th>
                <th>Contact Email</th>
                <th>Contact Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-cell">No departments found</td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr key={department.id}>
                    <td>
                      <div className="department-info">
                        <div className="department-name">{department.name}</div>
                        <div className="department-description">{department.description}</div>
                      </div>
                    </td>
                    <td>{department.headOfDepartment || 'Not assigned'}</td>
                    <td>{department.contactEmail || 'Not provided'}</td>
                    <td>{department.contactPhone || 'Not provided'}</td>
                    <td>
                      <span className={`status-badge status-${department.status?.toLowerCase() || 'active'}`}>
                        {department.status || 'Active'}
                      </span>
                    </td>
                    <td>{new Date(department.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditDepartment(department)}
                          title="Edit Department"
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteDepartment(department.id)}
                          title="Delete Department"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );



  const renderSecurityTab = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3 className="section-title">Security Settings</h3>
        
        {/* Current User Info */}
        <div className="security-section">
          <h4>Current Account Information</h4>
          <div className="security-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Current Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    value={auth.currentUser?.email || 'Not available'}
                    disabled
                    className="disabled-input"
                  />
                  <div className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Email Change Section */}
        <div className="security-section">
          <h4>Change Email Address</h4>
          <div className="security-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="currentPasswordEmail">Current Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="currentPasswordEmail"
                    value={securityForm.currentPasswordEmail}
                    onChange={(e) => handleSecurityInputChange('currentPasswordEmail', e.target.value)}
                    placeholder="Enter current password"
                  />
                  <div className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 21H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newEmail">New Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="newEmail"
                    value={securityForm.newEmail}
                    onChange={(e) => handleSecurityInputChange('newEmail', e.target.value)}
                    placeholder="Enter new email"
                  />
                  <div className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="save-btn" onClick={handleEmailChange} disabled={securityLoading}>
                {securityLoading ? 'Updating...' : 'Change Email'}
              </button>
              <button className="cancel-btn" onClick={() => setSecurityForm(prev => ({ ...prev, newEmail: '', currentPasswordEmail: '' }))}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="security-section">
          <h4>Change Password</h4>
          <div className="security-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="currentPasswordPass">Current Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="currentPassword"
                    value={securityForm.currentPasswordPass}
                    onChange={(e) => handleSecurityInputChange('currentPasswordPass', e.target.value)}
                    placeholder="Enter current password"
                  />
                  <div className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 21H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="newPassword"
                    value={securityForm.newPassword}
                    onChange={(e) => handleSecurityInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                  <div className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 6V12C15 14.2091 13.2091 16 11 16H5C2.79086 16 1 14.2091 1 12V6C1 3.79086 2.79086 2 5 2H11C13.2091 2 15 3.79086 15 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {securityForm.newPassword && (
                  <div className="password-strength">
                    <span className="strength-label">Strength:</span>
                    <span 
                      className="strength-text" 
                      style={{ color: getPasswordStrength(securityForm.newPassword).color }}
                    >
                      {getPasswordStrength(securityForm.newPassword).text}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="confirmPassword"
                    value={securityForm.confirmPassword}
                    onChange={(e) => handleSecurityInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <div className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 6V12C15 14.2091 13.2091 16 11 16H5C2.79086 16 1 14.2091 1 12V6C1 3.79086 2.79086 2 5 2H11C13.2091 2 15 3.79086 15 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="save-btn" onClick={handlePasswordChange} disabled={securityLoading}>
                {securityLoading ? 'Updating...' : 'Change Password'}
              </button>
              <button className="cancel-btn" onClick={() => setSecurityForm(prev => ({ ...prev, newPassword: '', confirmPassword: '', currentPasswordPass: '' }))}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {securityMessage.text && (
          <div className={`message-box ${securityMessage.type}`}>
            {securityMessage.text}
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'departments':
        return renderDepartmentsTab();
      case 'security':
        return renderSecurityTab();
      default:
        return renderGeneralTab();
    }
  };

  const renderTabIcon = (tabId) => {
    switch (tabId) {
      case 'general':
  return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'departments':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'security':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 21H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            <li className="nav-item">
          <button
                onClick={() => window.history.back()}
                className="nav-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Dashboard</span>
          </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => window.history.back()}
                className="nav-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Patients</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => window.history.back()}
                className="nav-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Appointments</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => window.history.back()}
                className="nav-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 14C7 17.866 9.58172 21 12.7502 21C15.9187 21 18.5004 17.866 18.5004 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Lab Tests</span>
                </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => window.history.back()}
                className="nav-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Blood Bank</span>
                </button>
            </li>
          </ul>
          
          <div className="nav-section">
            <h3 className="nav-section-title">MANAGEMENT</h3>
            <ul className="nav-list">
              <li className="nav-item">
              <button
                  onClick={() => window.history.back()}
                  className="nav-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21V19C23 18.1353 22.7473 17.318 22.2999 16.6405C21.8525 15.9631 21.2408 15.4589 20.5371 15.1995" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13C16.7033 3.38949 17.3145 3.89371 17.7618 4.57098C18.2091 5.24826 18.4618 6.06536 18.4618 6.92984C18.4618 7.79432 18.2091 8.61142 17.7618 9.2887C17.3145 9.96597 16.7033 10.4702 16 10.7297" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                  <span>Staff</span>
              </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => window.history.back()}
                  className="nav-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 5H9.5C7.01472 5 5 7.01472 5 9.5C5 11.9853 7.01472 14 9.5 14H14.5C16.9853 14 19 16.0147 19 18.5C19 20.9853 16.9853 23 14.5 23H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="17" y1="1" x2="17" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="7" y1="19" x2="7" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Accounts</span>
                </button>
              </li>
              <li className="nav-item active">
                <button
                  className="nav-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5842 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6642 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.1441C4.69632 20.0435 4.47575 19.896 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6642 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Settings</span>
                </button>
              </li>
            </ul>
                </div>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={() => window.history.back()} className="logout-button">
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
        {/* Header */}
        <div className="content-header">
          <h1 className="page-title">System Settings</h1>
          <div className="user-info-header">
            <span>Settings Management</span>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Department Message Display */}
        {departmentMessage.text && (
          <div className={`message-box ${departmentMessage.type}`}>
            {departmentMessage.text}
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartmentModal && (
        <div className="modal-overlay" onClick={() => setShowAddDepartmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Department</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddDepartmentModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddDepartment} className="user-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="departmentName">Department Name</label>
                  <input
                    type="text"
                    id="departmentName"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter department name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="departmentDescription">Description</label>
                  <textarea
                    id="departmentDescription"
                    value={departmentForm.description}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter department description"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="headOfDepartment">Head of Department</label>
                  <input
                    type="text"
                    id="headOfDepartment"
                    value={departmentForm.headOfDepartment}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, headOfDepartment: e.target.value }))}
                    placeholder="Enter head of department name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="departmentEmail">Contact Email</label>
                  <input
                    type="email"
                    id="departmentEmail"
                    value={departmentForm.contactEmail}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="Enter contact email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="departmentPhone">Contact Phone</label>
                  <input
                    type="tel"
                    id="departmentPhone"
                    value={departmentForm.contactPhone}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="Enter contact phone"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="departmentStatus">Status</label>
                  <select
                    id="departmentStatus"
                    value={departmentForm.status}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddDepartmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={departmentLoading}>
                  {departmentLoading ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditDepartmentModal && (
        <div className="modal-overlay" onClick={() => setShowEditDepartmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Department</h3>
              <button
                className="modal-close"
                onClick={() => setShowEditDepartmentModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateDepartment} className="user-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="editDepartmentName">Department Name</label>
                  <input
                    type="text"
                    id="editDepartmentName"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter department name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editDepartmentDescription">Description</label>
                  <textarea
                    id="editDepartmentDescription"
                    value={departmentForm.description}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter department description"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editHeadOfDepartment">Head of Department</label>
                  <input
                    type="text"
                    id="editHeadOfDepartment"
                    value={departmentForm.headOfDepartment}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, headOfDepartment: e.target.value }))}
                    placeholder="Enter head of department name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editDepartmentEmail">Contact Email</label>
                  <input
                    type="email"
                    id="editDepartmentEmail"
                    value={departmentForm.contactEmail}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="Enter contact email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editDepartmentPhone">Contact Phone</label>
                  <input
                    type="tel"
                    id="editDepartmentPhone"
                    value={departmentForm.contactPhone}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="Enter contact phone"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editDepartmentStatus">Status</label>
                  <select
                    id="editDepartmentStatus"
                    value={departmentForm.status}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditDepartmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={departmentLoading}>
                  {departmentLoading ? 'Updating...' : 'Update Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Settings;
