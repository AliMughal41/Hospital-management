import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  createRecord,
  getRecord,
  updateRecord,
  deleteRecord
} from '../firebase/database';
import { generateAppointmentId } from '../utils/idGenerator';
import './Appointments.css';

function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    time: '',
    patient: '',
    doctor: '',
    department: '',
    room: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    if (user?.uid) {
      loadAppointments();
      loadStaff();
    }
  }, [user?.uid]);

  useEffect(() => {
    applyFilters();
  }, [appointments, searchTerm]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const result = await getRecord('appointments');
      if (result.success && result.data) {
        const appointmentsArray = Object.keys(result.data).map(key => ({
          id: key,
          ...result.data[key]
        }));
        setAppointments(appointmentsArray);
      }
    } catch (error) {
      console.log('Using mock data for appointments');
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
        console.log('All staff loaded:', staffArray);
        
        // Filter only doctors (remove admin from the filter to focus on actual doctors)
        const doctors = staffArray.filter(staff => 
          staff.category === 'doctor'
        );
        console.log('Doctors filtered:', doctors);
        setStaff(doctors);
      } else {
        console.log('No staff data found, using empty array');
        setStaff([]);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      // Fallback to mock doctors if Firebase fails
      const mockDoctors = [
        {
          id: 'mock-1',
          name: 'Dr. Taseen Shahid',
          category: 'doctor',
          department: 'Neurology'
        },
        {
          id: 'mock-2', 
          name: 'Dr. Sarah Ahmed',
          category: 'doctor',
          department: 'Cardiology'
        },
        {
          id: 'mock-3',
          name: 'Dr. Muhammad Ali',
          category: 'doctor', 
          department: 'Emergency'
        }
      ];
      console.log('Using mock doctors:', mockDoctors);
      setStaff(mockDoctors);
    }
  };

  const applyFilters = () => {
    let filtered = appointments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.appointmentId || appointment.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter for today's appointments
    const today = new Date().toISOString().split('T')[0];
    filtered = filtered.filter(appointment => appointment.date === today);

    setFilteredAppointments(filtered);
  };

  const generatePatientInitials = (patientName) => {
    return patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate appointment ID based on current table data
      const autoAppointmentId = generateAppointmentId(appointments);
      
      const appointmentData = {
        ...newAppointment,
        appointmentId: autoAppointmentId,
        patientInitials: generatePatientInitials(newAppointment.patient),
        status: 'scheduled'
      };

      // Try to save to Firebase
      const result = await createRecord('appointments', appointmentData);
      
      if (result.success) {
        const newAppointmentWithId = {
          id: result.id,
          ...appointmentData
        };
        
        // Update local state
        setAppointments(prev => [...prev, newAppointmentWithId]);
        setNewAppointment({
          time: '',
          patient: '',
          doctor: '',
          department: '',
          room: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
          status: 'scheduled'
        });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
    setLoading(false);
  };

  const handleEditAppointment = async (appointmentData) => {
    setLoading(true);
    try {
      const updatedData = {
        ...appointmentData,
        patientInitials: generatePatientInitials(appointmentData.patient)
      };

      await updateRecord(`appointments/${editingAppointment.id}`, updatedData);
      
      setAppointments(prev => prev.map(appointment =>
        appointment.id === editingAppointment.id ? { ...appointment, ...updatedData } : appointment
      ));
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
    setLoading(false);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    setLoading(true);
    try {
      await deleteRecord(`appointments/${appointmentId}`);
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
    setLoading(false);
  };

  const handleDoctorChange = (doctorName) => {
    const selectedDoctor = staff.find(doctor => doctor.name === doctorName);
    setNewAppointment(prev => ({
      ...prev,
      doctor: doctorName,
      department: selectedDoctor?.department || prev.department
    }));
  };

  const renderAppointmentActions = (appointment) => (
    <div className="appointment-actions">
      <button
        className="action-btn delete-btn"
        title="Delete Appointment"
        onClick={() => handleDeleteAppointment(appointment.id)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        className="action-btn edit-btn"
        title="Edit Appointment"
        onClick={() => setEditingAppointment(appointment)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <h1 className="appointments-title">Appointments</h1>
        <button 
          className="new-appointment-btn"
          onClick={() => setShowAddModal(true)}
        >
          New Appointment
        </button>
      </div>

      <div className="appointments-search">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search appointments"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="appointments-content">
        <div className="appointments-section">
          <h2 className="section-title">Today's Appointments</h2>
          
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TIME</th>
                  <th>PATIENT</th>
                  <th>DOCTOR</th>
                  <th>DEPARTMENT</th>
                  <th>ROOM</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="loading-cell">Loading appointments...</td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data-cell">No appointments found for today</td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="appointment-row">
                      <td className="appointment-id">{appointment.appointmentId || appointment.id}</td>
                      <td className="appointment-time">
                        <div className="time-wrapper">
                          <div className="time-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <span className="time-text">{appointment.time}</span>
                        </div>
                      </td>
                      <td className="appointment-patient">
                        <div className="patient-wrapper">
                          <span className="patient-initials">
                            {appointment.patientInitials}
                          </span>
                          <span className="patient-name">{appointment.patient}</span>
                          <div className="mobile-actions">
                            <button
                              className="action-btn delete-btn"
                              title="Delete Appointment"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              className="action-btn edit-btn"
                              title="Edit Appointment"
                              onClick={() => setEditingAppointment(appointment)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="appointment-doctor">{appointment.doctor}</td>
                      <td className="appointment-department">{appointment.department}</td>
                      <td className="appointment-room">{appointment.room}</td>
                      <td className="appointment-status">
                        <span className={`status-badge status-${appointment.status?.toLowerCase() || 'scheduled'}`}>
                          {appointment.status || 'Scheduled'}
                        </span>
                      </td>
                      <td className="appointment-actions-cell">
                        {renderAppointmentActions(appointment)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="appointments-pagination">
          <span className="pagination-info">
            Showing {filteredAppointments.length} of {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length} appointments
          </span>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>Previous</button>
            <button className="pagination-btn primary">Next</button>
          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>New Appointment</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddAppointment} className="appointment-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input
                    type="text"
                    value={newAppointment.patient}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, patient: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Doctor</label>
                  <select
                    value={newAppointment.doctor}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {staff.length === 0 ? (
                      <option value="" disabled>No doctors available</option>
                    ) : (
                      staff.map((doctor) => (
                        <option key={doctor.id} value={doctor.name}>
                          {doctor.name} - {doctor.department || 'General'} ({doctor.category})
                        </option>
                      ))
                    )}
                  </select>
                  {staff.length === 0 && (
                    <small style={{ color: '#dc2626', fontSize: '12px' }}>
                      No doctors found. Please add doctors in the Staff Directory first.
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={newAppointment.department}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, department: e.target.value }))}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Room</label>
                  <input
                    type="text"
                    value={newAppointment.room}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, room: e.target.value }))}
                    placeholder="e.g., Room 251"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newAppointment.status}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, status: e.target.value }))}
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    placeholder="Additional notes about the appointment"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Appointment</h3>
              <button
                className="modal-close"
                onClick={() => setEditingAppointment(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updates = {
                patient: formData.get('patient'),
                doctor: formData.get('doctor'),
                date: formData.get('date'),
                time: formData.get('time'),
                department: formData.get('department'),
                room: formData.get('room'),
                status: formData.get('status'),
                notes: formData.get('notes')
              };
              handleEditAppointment(updates);
            }} className="appointment-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input
                    type="text"
                    name="patient"
                    defaultValue={editingAppointment.patient}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Doctor</label>
                  <select name="doctor" defaultValue={editingAppointment.doctor} required>
                    <option value="">Select Doctor</option>
                    {staff.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name} - {doctor.department || 'General'} ({doctor.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editingAppointment.date}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={editingAppointment.time}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select name="department" defaultValue={editingAppointment.department} required>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Room</label>
                  <input
                    type="text"
                    name="room"
                    defaultValue={editingAppointment.room}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" defaultValue={editingAppointment.status} required>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={editingAppointment.notes}
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingAppointment(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
