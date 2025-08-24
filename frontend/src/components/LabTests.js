import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  createRecord,
  getRecord,
  updateRecord,
  deleteRecord,
  subscribeToRecord
} from '../firebase/database';
import { generateLabTestId } from '../utils/idGenerator';
import './LabTests.css';

function LabTests() {
  const { user, userProfile } = useAuth();
  const [labTests, setLabTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [newTest, setNewTest] = useState({
    testName: '',
    patient: '',
    doctor: '',
    status: 'Pending',
    testDate: '',
    testTime: ''
  });

  useEffect(() => {
    if (user?.uid) {
      loadLabTests();
      loadStaff();
    }
  }, [user?.uid]);

  // useEffect(() => {
  //   // Apply search filtering
  //   if (searchTerm) {
  //     const filtered = labTests.filter(test =>
  //       test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       (test.testId || test.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       test.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       test.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       (test.testDate && test.testDate.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //       (test.testTime && test.testTime.toLowerCase().includes(searchTerm.toLowerCase()))
  //     );
  //     setLabTests(filtered);
  //   } else {
  //     // If no search term, load all tests
  //     loadLabTests();
  //   }
  // }, [searchTerm]);

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const d = new Date(dateStr);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };

  const loadLabTests = async () => {
    setLoading(true);
    try {
      console.log('Loading lab tests...');
      
      const result = await getRecord('labTests');
      
      console.log('Load result:', result);
       
      if (result.success && result.data) {
        const testsArray = Object.keys(result.data).map(key => ({
          id: key,
          ...result.data[key]
        }));
        console.log('Parsed lab tests:', testsArray);
        if (userProfile?.role === 'technician') {
          const todays = testsArray.filter(t => isToday(t.testDate));
          setLabTests(todays);
        } else {
          setLabTests(testsArray);
        }
      } else {
        console.log('No lab tests found or error:', result.message);
        setLabTests([]);
      }
    } catch (error) {
      console.error('Error loading lab tests:', error);
      setLabTests([]);
    }
    setLoading(false);
  };

  const loadStaff = async () => {
    try {
      const result = await getRecord('staff');
      if (result.success && result.data) {
        const staffArray = Object.keys(result.data).map(key => ({
          id: key,
          ...result.data[key]
        }));
        // Filter only doctors and admin staff
        const doctors = staffArray.filter(staff => 
          staff.category === 'doctor' || staff.category === 'admin'
        );
        setStaff(doctors);
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaff([]);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Generate lab test ID based on current table data
      const autoTestId = generateLabTestId(labTests);
      
      const testData = {
        ...newTest,
        testId: autoTestId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      console.log('Creating lab test:', testData);
      
      const result = await createRecord('labTests', testData);
      
      console.log('Create result:', result);
      
      if (result.success) {
        const newTestWithId = {
          id: result.id,
          ...testData
        };
        setLabTests(prev => [...prev, newTestWithId]);
        setNewTest({
          testName: '',
          patient: '',
          doctor: '',
          status: 'Pending',
          testDate: '',
          testTime: ''
        });
        setShowAddModal(false);
        alert('Lab test created successfully!');
      } else {
        alert(`Failed to create lab test: ${result.message}`);
      }
    } catch (error) {
      console.error('Error adding lab test:', error);
      alert(`Error creating lab test: ${error.message}`);
    }
    setLoading(false);
  };

  const handleEditTest = async (testData) => {
    setLoading(true);
    try {
      console.log('Updating lab test:', testData.id, testData);
      
      const result = await updateRecord(`labTests/${testData.id}`, {
        ...testData,
        updatedAt: Date.now()
      });
      
      console.log('Update result:', result);
      
      if (result.success) {
        setLabTests(prev => prev.map(test => 
          test.id === testData.id ? { ...test, ...testData } : test
        ));
        setEditingTest(null);
        alert('Lab test updated successfully!');
      } else {
        alert(`Failed to update lab test: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating lab test:', error);
      alert(`Error updating lab test: ${error.message}`);
    }
    setLoading(false);
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this lab test?')) {
      setLoading(true);
      try {
        console.log('Deleting lab test:', testId);
        
        const result = await deleteRecord(`labTests/${testId}`);
        
        console.log('Delete result:', result);
        
        if (result.success) {
          setLabTests(prev => prev.filter(test => test.id !== testId));
          alert('Lab test deleted successfully!');
        } else {
          alert(`Failed to delete lab test: ${result.message}`);
        }
      } catch (error) {
        console.error('Error deleting lab test:', error);
        alert(`Error deleting lab test: ${error.message}`);
      }
      setLoading(false);
    }
  };

  const renderTestActions = (test) => (
    <div className="test-actions">
      <button
        className="action-btn edit-btn"
        title="Edit Test"
        onClick={() => setEditingTest(test)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {userProfile?.role !== 'technician' && (
        <button
          className="action-btn delete-btn"
          title="Delete Test"
          onClick={() => handleDeleteTest(test.id)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'critical':
        return 'status-badge critical';
      case 'pending':
        return 'status-badge pending';
      case 'completed':
        return 'status-badge completed';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    try {
      // Handle different date formats
      let date;
      if (dateString.includes('-') && dateString.includes(':')) {
        // Handle ISO-like format: "2020-09-08 20:06"
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart ? timePart.split(':') : ['00', '00'];
        date = new Date(year, month - 1, day, hour, minute);
      } else if (dateString.includes('-')) {
        // Handle ISO date format
        date = new Date(dateString);
      } else {
        // Handle other formats
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateForInput = (dateString) => {
    try {
      if (!dateString) return '';
      
      // If it's already in YYYY-MM-DD format, return as-is
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      // Parse other date formats and convert to YYYY-MM-DD
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="lab-tests-page">
      {/* Header */}
      <div className="lab-tests-header">
        <div className="breadcrumb">
          <span>Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span>Lab Tests</span>
        </div>
        <h1 className="lab-tests-title">Laboratory Tests</h1>
      </div>

      {/* Controls */}
      <div className="lab-tests-controls">
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
              placeholder="Search Tests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="controls-right">
          {userProfile?.role !== 'technician' && (
            <button
              className="order-new-test-btn"
              onClick={() => setShowAddModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Order New Test
            </button>
          )}
        </div>
      </div>

      {/* Lab Tests Table */}
      <div className="lab-tests-table-container">
        <div className="table-header">
          <h3 className="table-title">Laboratory Tests</h3>
        </div>
        
        <div className="table-wrapper">
          <table className="lab-tests-table">
            <thead>
              <tr>
                <th>TEST ID</th>
                <th>TEST NAME</th>
                <th>PATIENT</th>
                <th>DOCTOR</th>
                <th>TEST DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading-cell">
                    <div className="loading-spinner">Loading...</div>
                  </td>
                </tr>
              ) : labTests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    <div className="empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 14C7 17.866 9.58172 21 12.7502 21C15.9187 21 18.5004 17.866 18.5004 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p>No lab tests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                labTests.map((test) => (
                  <tr key={test.id} className="test-row">
                    <td>
                      <div className="test-id">
                        <div className="test-id-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 14C7 17.866 9.58172 21 12.7502 21C15.9187 21 18.5004 17.866 18.5004 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {test.testId || test.id}
                      </div>
                    </td>
                    <td>
                      <div className="test-name">
                        {test.testName}
                        <div className="mobile-actions">
                          <button
                            className="action-btn edit-btn"
                            title="Edit Test"
                            onClick={() => setEditingTest(test)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button
                            className="action-btn delete-btn"
                            title="Delete Test"
                            onClick={() => handleDeleteTest(test.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="patient-name">{test.patient}</div>
                    </td>
                    <td>
                      <div className="doctor-name">{test.doctor}</div>
                    </td>
                    <td>
                      <div className="test-datetime">
                        {test.testDate && test.testTime ? (
                          <>
                            <div className="test-date">{formatDateForInput(test.testDate)}</div>
                            <div className="test-time">{test.testTime}</div>
                          </>
                        ) : (
                          <span className="no-datetime">Not scheduled</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(test.status)}>
                        {test.status}
                      </span>
                    </td>
                    <td>
                      {renderTestActions(test)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="lab-tests-pagination">
        <div className="pagination-info">
          Showing {labTests.length} of {labTests.length} tests
        </div>
        <div className="pagination-controls">
          <button className="pagination-btn" disabled>
            Previous
          </button>
          <button className="pagination-btn primary">
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && userProfile?.role !== 'technician' && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order New Lab Test</h3>
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
            <form onSubmit={handleAddTest} className="test-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="testName">Test Name</label>
                  <input
                    type="text"
                    id="testName"
                    value={newTest.testName}
                    onChange={(e) => setNewTest(prev => ({ ...prev, testName: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="patient">Patient</label>
                  <input
                    type="text"
                    id="patient"
                    value={newTest.patient}
                    onChange={(e) => setNewTest(prev => ({ ...prev, patient: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="doctor">Doctor</label>
                  <select
                    id="doctor"
                    value={newTest.doctor}
                    onChange={(e) => setNewTest(prev => ({ ...prev, doctor: e.target.value }))}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {staff.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name} ({doctor.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={newTest.status}
                    onChange={(e) => setNewTest(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="testDate">Test Date</label>
                  <input
                    type="date"
                    id="testDate"
                    value={newTest.testDate}
                    onChange={(e) => setNewTest(prev => ({ ...prev, testDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="testTime">Test Time</label>
                  <input
                    type="time"
                    id="testTime"
                    value={newTest.testTime}
                    onChange={(e) => setNewTest(prev => ({ ...prev, testTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTest && (
        <div className="modal-overlay" onClick={() => setEditingTest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Lab Test</h3>
              <button
                className="modal-close"
                onClick={() => setEditingTest(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditTest(editingTest); }} className="test-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="editTestName">Test Name</label>
                  <input
                    type="text"
                    id="editTestName"
                    value={editingTest.testName}
                    onChange={(e) => setEditingTest(prev => ({ ...prev, testName: e.target.value }))}
                    disabled={userProfile?.role === 'technician'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editPatient">Patient</label>
                  <input
                    type="text"
                    id="editPatient"
                    value={editingTest.patient}
                    onChange={(e) => setEditingTest(prev => ({ ...prev, patient: e.target.value }))}
                    disabled={userProfile?.role === 'technician'}
                    required
                  />
                </div>
                {userProfile?.role !== 'technician' && (
                  <div className="form-group">
                    <label htmlFor="editDoctor">Doctor</label>
                    <select
                      id="editDoctor"
                      value={editingTest.doctor}
                      onChange={(e) => setEditingTest(prev => ({ ...prev, doctor: e.target.value }))}
                      required
                    >
                      <option value="">Select Doctor</option>
                      {staff.map((doctor) => (
                        <option key={doctor.id} value={doctor.name}>
                          {doctor.name} ({doctor.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="editStatus">Status</label>
                  <select
                    id="editStatus"
                    value={editingTest.status}
                    onChange={(e) => setEditingTest(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {userProfile?.role !== 'technician' && (
                  <div className="form-group">
                    <label htmlFor="editTestDate">Test Date</label>
                    <input
                      type="date"
                      id="editTestDate"
                      value={editingTest.testDate}
                      onChange={(e) => setEditingTest(prev => ({ ...prev, testDate: e.target.value }))}
                      required
                    />
                  </div>
                )}

                {userProfile?.role !== 'technician' && (
                  <div className="form-group">
                    <label htmlFor="editTestTime">Test Time</label>
                    <input
                      type="time"
                      id="editTestTime"
                      value={editingTest.testTime}
                      onChange={(e) => setEditingTest(prev => ({ ...prev, testTime: e.target.value }))}
                      required
                    />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingTest(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabTests;
