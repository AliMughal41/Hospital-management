import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  createRecord,
  getRecord,
  updateRecord,
  deleteRecord
} from '../firebase/database';
import { generatePatientId } from '../utils/idGenerator';
import './Patients.css';

function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  // const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    department: '',
    status: 'Outpatient',
    phone: '',
    email: '',
    address: '',
    bloodType: '',
    emergencyContact: ''
  });

  useEffect(() => {
    if (user?.uid) {
      loadPatients();
      loadDepartments();
    }
  }, [user?.uid]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeTab, patients]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      // Try to load patients from Firebase, fall back to mock data
      const result = await getRecord('patients');
      if (result.success && result.data) {
        const patientsArray = Object.keys(result.data).map(key => ({
          id: key,
          ...result.data[key]
        }));
        setPatients(patientsArray);
      }
    } catch (error) {
      console.log('Using mock data for patients');
    }
    setLoading(false);
  };

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

  const applyFilters = () => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.patientId || patient.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(patient =>
        patient.status.toLowerCase() === activeTab.toLowerCase()
      );
    }

    setFilteredPatients(filtered);
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate patient ID based on current table data
      const autoPatientId = generatePatientId(patients);
      
      const patientData = {
        ...newPatient,
        patientId: autoPatientId,
        age: parseInt(newPatient.age)
      };

      // Try to save to Firebase
      const result = await createRecord('patients', patientData);
      
      if (result.success) {
        const newPatientWithId = {
          id: result.id,
          ...patientData
        };
        
        // Update local state
        setPatients(prev => [...prev, newPatientWithId]);
        setNewPatient({
          name: '',
          age: '',
          gender: 'Male',
          department: '',
          status: 'Outpatient',
          phone: '',
          email: '',
          address: '',
          bloodType: '',
          emergencyContact: ''
        });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
    }
    setLoading(false);
  };

  const handleEditPatient = async (patientData) => {
    setLoading(true);
    try {
      await updateRecord(`patients/${editingPatient.id}`, patientData);
      
      setPatients(prev => prev.map(patient =>
        patient.id === editingPatient.id ? { ...patient, ...patientData } : patient
      ));
      setEditingPatient(null);
    } catch (error) {
      console.error('Error updating patient:', error);
    }
    setLoading(false);
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;

    setLoading(true);
    try {
      await deleteRecord(`patients/${patientId}`);
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
    setLoading(false);
  };

  const renderPatientActions = (patient) => (
    <div className="patient-actions">
      <button
        className="action-btn edit-btn"
        title="Edit Patient"
        onClick={() => setEditingPatient(patient)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        className="action-btn delete-btn"
        title="Delete Patient"
        onClick={() => handleDeletePatient(patient.id)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );

  return (
    <div className="patients-page">
      <div className="patients-header">
        <h1 className="patients-title">Patient Records</h1>
        <button 
          className="add-patient-btn"
          onClick={() => setShowAddModal(true)}
        >
          Add New Patient
        </button>
      </div>

      <div className="patients-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Enter name, ID or phone number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <button 
          className="filter-btn"
          onClick={() => console.log('Filter modal not implemented')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Filter
        </button>
      </div>

      <div className="patients-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Patients
        </button>
        <button
          className={`tab-btn ${activeTab === 'inpatient' ? 'active' : ''}`}
          onClick={() => setActiveTab('inpatient')}
        >
          Inpatient
        </button>
        <button
          className={`tab-btn ${activeTab === 'outpatient' ? 'active' : ''}`}
          onClick={() => setActiveTab('outpatient')}
        >
          Outpatient
        </button>
        <button
          className={`tab-btn ${activeTab === 'recently' ? 'active' : ''}`}
          onClick={() => setActiveTab('recently')}
        >
          Recently Added
        </button>
      </div>

      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>AGE</th>
              <th>GENDER</th>
              <th>DEPARTMENT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-cell">Loading patients...</td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data-cell">No patients found</td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="patient-row">
                  <td className="patient-id">{patient.patientId || patient.id}</td>
                  <td className="patient-name">
                    <div className="name-wrapper">
                      <span className="name-initials">
                        {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                      <span className="name-text">{patient.name}</span>
                      
                    </div>
                  </td>
                  <td className="patient-age">{patient.age}</td>
                  <td className="patient-gender">{patient.gender}</td>
                  <td className="patient-department">{patient.department}</td>
                  <td className="patient-status">
                    <span className={`status-badge ${patient.status.toLowerCase()}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="patient-actions-cell">
                    {renderPatientActions(patient)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="patients-pagination">
        <span className="pagination-info">
          Showing {filteredPatients.length} of {patients.length} patients
        </span>
        <div className="pagination-controls">
          <button className="pagination-btn" disabled>Previous</button>
          <button className="pagination-btn primary">Next</button>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Patient</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="patient-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={newPatient.department}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, department: e.target.value }))}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newPatient.status}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Outpatient">Outpatient</option>
                    <option value="Inpatient">Inpatient</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    value={newPatient.address}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                    rows="2"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Patient</h3>
              <button
                className="modal-close"
                onClick={() => setEditingPatient(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updates = {
                name: formData.get('name'),
                age: parseInt(formData.get('age')),
                gender: formData.get('gender'),
                department: formData.get('department'),
                status: formData.get('status'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                address: formData.get('address')
              };
              handleEditPatient(updates);
            }} className="patient-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingPatient.name}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    defaultValue={editingPatient.age}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" defaultValue={editingPatient.gender}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select name="department" defaultValue={editingPatient.department} required>
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" defaultValue={editingPatient.status}>
                    <option value="Outpatient">Outpatient</option>
                    <option value="Inpatient">Inpatient</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingPatient.phone}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingPatient.email}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    name="address"
                    defaultValue={editingPatient.address}
                    rows="2"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingPatient(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;
