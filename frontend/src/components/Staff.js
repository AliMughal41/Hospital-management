import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  createRecord,
  getRecord,
  updateRecord,
  deleteRecord,
  subscribeToRecord
} from '../firebase/database';
import { createUser } from '../firebase/auth';
import { generateStaffId } from '../utils/idGenerator';
import './Staff.css';

function Staff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([
    {
      id: 'ST-001',
      name: 'Taseen Shahid',
      staffId: 'ST-001',
      department: 'Neurology',
      category: 'doctor',
      contact: {
        phone: '03008742776',
        email: 'shahidtaseen2002@gmail.com'
      },
      status: 'Active'
    }
  ]);
  const [filteredStaff, setFilteredStaff] = useState(staff);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    staffId: '',
    department: '',
    category: 'doctor',
    contact: {
      phone: '',
      email: ''
    },
    joiningDate: '',
    status: 'Active',
    password: '',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  useEffect(() => {
    if (user?.uid) {
      loadStaff();
    }
  }, [user?.uid]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeCategory, staff]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const result = await getRecord('staff');
      if (result.success && result.data) {
        const staffArray = Object.keys(result.data).map(key => ({
          id: key,
          ...result.data[key],
          contact: {
            phone: result.data[key].contact?.phone || '',
            email: result.data[key].contact?.email || ''
          }
        }));
        setStaff(staffArray);
      }
    } catch (error) {
      console.log('Using mock data for staff');
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = staff;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(staffMember =>
        staffMember.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staffMember.staffId || staffMember.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staffMember.contact?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        staffMember.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(staffMember => 
        staffMember.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    setFilteredStaff(filtered);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Generate staff ID based on current table data
      const autoStaffId = generateStaffId(staff);
      
      const staffData = {
        ...newStaff,
        staffId: autoStaffId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // If category is admin, doctor, technician or receptionist, create authentication account
      if (newStaff.category === 'admin' || newStaff.category === 'doctor' || newStaff.category === 'technician' || newStaff.category === 'receptionist') {
        let passwordInputId = 'staffPassword';
        if (newStaff.category === 'admin') passwordInputId = 'adminPassword';
        if (newStaff.category === 'technician') passwordInputId = 'technicianPassword';
        if (newStaff.category === 'receptionist') passwordInputId = 'receptionistPassword';

        const passwordElement = document.getElementById(passwordInputId);
        const password = passwordElement ? passwordElement.value : '';
        if (!password || password.length < 6) {
          alert('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        
        const authResult = await createUser(newStaff.contact.email, password, newStaff.name);
        if (!authResult.success) {
          alert(`Failed to create ${newStaff.category} account: ${authResult.message}`);
          setLoading(false);
          return;
        }
        
        // Add auth UID to staff data
        staffData.authUid = authResult.user.uid;
        staffData.isAdmin = newStaff.category === 'admin';
        staffData.isDoctor = newStaff.category === 'doctor';
        staffData.isTechnician = newStaff.category === 'technician';
        staffData.isReceptionist = newStaff.category === 'receptionist';
      }
      
      const result = await createRecord('staff', staffData);
      if (result.success) {
        const newStaffWithId = {
          id: result.id,
          ...staffData
        };
        setStaff(prev => [...prev, newStaffWithId]);
        setNewStaff({
          name: '',
          staffId: '',
          department: '',
          category: 'doctor',
          contact: {
            phone: '',
            email: ''
          },
          joiningDate: '',
          status: 'Active',
          password: '',
          shiftStart: '09:00',
          shiftEnd: '17:00',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        });
        setShowAddModal(false);
        
        if (newStaff.category === 'admin' || newStaff.category === 'doctor' || newStaff.category === 'technician' || newStaff.category === 'receptionist') {
          alert(`${newStaff.category.charAt(0).toUpperCase() + newStaff.category.slice(1)} account created successfully! They can now login with their email and password.`);
        }
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Error adding staff member. Please try again.');
    }
    setLoading(false);
  };

  const handleEditStaff = async (staffData) => {
    setLoading(true);
    try {
      const result = await updateRecord(`staff/${staffData.id}`, {
        ...staffData,
        updatedAt: Date.now()
      });
      if (result.success) {
        setStaff(prev => prev.map(item => 
          item.id === staffData.id ? { ...item, ...staffData } : item
        ));
        setEditingStaff(null);
      }
    } catch (error) {
      console.error('Error updating staff:', error);
    }
    setLoading(false);
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setLoading(true);
      try {
        const result = await deleteRecord(`staff/${staffId}`);
        if (result.success) {
          setStaff(prev => prev.filter(item => item.id !== staffId));
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-active';
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'on leave':
        return 'status-on-leave';
      default:
        return 'status-active';
    }
  };

  const getCategoryBadgeClass = (category) => {
    if (!category) return 'category-doctor';
    switch (category.toLowerCase()) {
      case 'doctor':
        return 'category-doctor';
      case 'nurse':
        return 'category-nurse';
      case 'technician':
        return 'category-technician';
      case 'admin':
        return 'category-admin';
      default:
        return 'category-doctor';
    }
  };

  const getCategoryCount = (category) => {
    if (category === 'all') {
      return staff.length;
    }
    return staff.filter(staffMember => 
      staffMember.category?.toLowerCase() === category.toLowerCase()
    ).length;
  };

  const categories = [
    { id: 'all', label: 'All Staff' },
    { id: 'doctor', label: 'Doctors' },
    { id: 'nurse', label: 'Nurses' },
    { id: 'technician', label: 'Technicians' },
    { id: 'receptionist', label: 'Receptionist' },
    { id: 'admin', label: 'Admin' }
  ];

  const getInitials = (name) => {
    if (!name) return 'N/A';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className="staff-page">
      {/* Header */}
      <div className="staff-header">
        <div className="staff-title-section">
          <h1 className="staff-title">Staff Directory</h1>
        </div>
        <div className="staff-actions">
          <button
            className="add-staff-btn"
            onClick={() => setShowAddModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add New Staff
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="staff-search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <div className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search staff by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="staff-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-filter ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label} ({getCategoryCount(category.id)})
          </button>
        ))}
      </div>

      {/* Staff Table */}
      <div className="staff-table-container">
        <div className="table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>STAFF MEMBER</th>
                <th>STAFF ID</th>
                <th>DEPARTMENT</th>
                <th>CATEGORY</th>
                <th>CONTACT</th>
                <th>JOINING DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="loading-cell">
                    <div className="loading-spinner">Loading...</div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    <div className="empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21V19C23 18.1353 22.7473 17.318 22.2999 16.6405C21.8525 15.9631 21.2408 15.4589 20.5371 15.1995" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 3.13C16.7033 3.38949 17.3145 3.89371 17.7618 4.57098C18.2091 5.24826 18.4618 6.06536 18.4618 6.92984C18.4618 7.79432 18.2091 8.61142 17.7618 9.2887C17.3145 9.96597 16.7033 10.4702 16 10.7297" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p>No staff members found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id} className="staff-row">
                    <td>
                      <div className="staff-member">
                        <div className="staff-avatar">
                          <span>{getInitials(staffMember.name)}</span>
                        </div>
                        <div className="staff-info">
                          <div className="staff-name">{staffMember.name || 'N/A'}</div>
                          <div className="staff-id">{staffMember.staffId || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="staff-id-cell">{staffMember.staffId || staffMember.id || 'N/A'}</div>
                    </td>
                    <td>
                      <div className="department">{staffMember.department || 'N/A'}</div>
                    </td>
                    <td>
                      <span className={`category-badge ${getCategoryBadgeClass(staffMember.category)}`}>
                        {staffMember.category || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-phone">{staffMember.contact?.phone || 'N/A'}</div>
                        <div className="contact-email">{staffMember.contact?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="joining-date">
                        {staffMember.joiningDate ? new Date(staffMember.joiningDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(staffMember.status)}`}>
                        {staffMember.status || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="staff-actions">
                        <button
                          className="edit-btn"
                          onClick={() => setEditingStaff(staffMember)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteStaff(staffMember.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19,6V20C19,20.5523 18.5523,21 18,21H6C5.44772,21 5,20.5523 5,20V6M8,6V4C8,3.44772 8.44772,3 9,3H15C15.5523,3 16,3.44772 16,4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
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

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Staff Member</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="staff-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="staffId">Staff ID</label>
                  <input
                    type="text"
                    id="staffId"
                    value={newStaff.staffId}
                    placeholder="Auto-generated"
                    readOnly
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, department: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={newStaff.category}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="technician">Technician</option>
                    <option value="admin">Admin</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={newStaff.contact.phone}
                    onChange={(e) => setNewStaff(prev => ({ 
                      ...prev, 
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={newStaff.contact.email}
                    onChange={(e) => setNewStaff(prev => ({ 
                      ...prev, 
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    required
                  />
                </div>
                {newStaff.category === 'admin' && (
                  <div className="form-group">
                    <label htmlFor="adminPassword">Admin Password</label>
                    <input
                      type="password"
                      id="adminPassword"
                      placeholder="Minimum 6 characters"
                      minLength="6"
                      required
                    />
                  </div>
                )}
                {newStaff.category === 'doctor' && (
                  <div className="form-group">
                    <label htmlFor="staffPassword">Password</label>
                    <input
                      type="password"
                      id="staffPassword"
                      placeholder="Minimum 6 characters"
                      minLength="6"
                      required
                    />
                  </div>
                )}
                {newStaff.category === 'technician' && (
                  <div className="form-group">
                    <label htmlFor="technicianPassword">Technician Password</label>
                    <input
                      type="password"
                      id="technicianPassword"
                      placeholder="Minimum 6 characters"
                      minLength="6"
                      required
                    />
                  </div>
                )}
                {newStaff.category === 'receptionist' && (
                  <div className="form-group">
                    <label htmlFor="receptionistPassword">Receptionist Password</label>
                    <input
                      type="password"
                      id="receptionistPassword"
                      placeholder="Minimum 6 characters"
                      minLength="6"
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="joiningDate">Joining Date</label>
                  <input
                    type="date"
                    id="joiningDate"
                    value={newStaff.joiningDate}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, joiningDate: e.target.value }))}
                    required
                  />
                </div>
                {(newStaff.category === 'doctor' || newStaff.category === 'technician') && (
                  <>
                    <div className="form-group">
                      <label htmlFor="shiftStart">Shift Start Time</label>
                      <input
                        type="time"
                        id="shiftStart"
                        value={newStaff.shiftStart}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, shiftStart: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="shiftEnd">Shift End Time</label>
                      <input
                        type="time"
                        id="shiftEnd"
                        value={newStaff.shiftEnd}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, shiftEnd: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Working Days</label>
                      <div className="working-days-checkboxes">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <label key={day} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={newStaff.workingDays.includes(day)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewStaff(prev => ({
                                    ...prev,
                                    workingDays: [...prev.workingDays, day]
                                  }));
                                } else {
                                  setNewStaff(prev => ({
                                    ...prev,
                                    workingDays: prev.workingDays.filter(d => d !== day)
                                  }));
                                }
                              }}
                            />
                            {day}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* {newStaff.category === 'admin' && (
                  <div className="form-group">
                    <label htmlFor="adminPassword">Admin Password</label>
                    <input
                      type="password"
                      id="adminPassword"
                      placeholder="Minimum 6 characters"
                      minLength="6"
                      required
                    />
                  </div>
                )}
                {newStaff.category === 'doctor' && (
                  <div className="form-group">
                    <label htmlFor="staffPassword">Password</label>
                    <input
                      type="password"
                      id="staffPassword"
                      placeholder="Minimum 6 characters"
                      minLength="6"
                      required
                    />
                  </div>
                )} */}
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="modal-overlay" onClick={() => setEditingStaff(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Staff Member</h3>
              <button
                className="modal-close"
                onClick={() => setEditingStaff(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditStaff(editingStaff); }} className="staff-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-name">Full Name</label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-staffId">Staff ID</label>
                  <input
                    type="text"
                    id="edit-staffId"
                    value={editingStaff.staffId}
                    readOnly
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-department">Department</label>
                  <input
                    type="text"
                    id="edit-department"
                    value={editingStaff.department}
                    onChange={(e) => setEditingStaff(prev => ({ ...prev, department: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-category">Category</label>
                  <select
                    id="edit-category"
                    value={editingStaff.category}
                    onChange={(e) => setEditingStaff(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="technician">Technician</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="edit-phone"
                    value={editingStaff.contact.phone}
                    onChange={(e) => setEditingStaff(prev => ({ 
                      ...prev, 
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-email">Email</label>
                  <input
                    type="email"
                    id="edit-email"
                    value={editingStaff.contact.email}
                    onChange={(e) => setEditingStaff(prev => ({ 
                      ...prev, 
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-joiningDate">Joining Date</label>
                  <input
                    type="date"
                    id="edit-joiningDate"
                    value={editingStaff.joiningDate || ''}
                    onChange={(e) => setEditingStaff(prev => ({ ...prev, joiningDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingStaff(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
