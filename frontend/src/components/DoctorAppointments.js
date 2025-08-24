import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getRecord,
  updateRecord,
  createRecord
} from '../firebase/database';
import './DoctorAppointments.css';

function DoctorAppointments() {
  const { user, userProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    medications: '',
    instructions: '',
    followUp: ''
  });

  useEffect(() => {
    if (user?.uid) {
      loadDoctorAppointments();
    }
  }, [user?.uid]);

  const loadDoctorAppointments = async () => {
    setLoading(true);
    try {
      const result = await getRecord('appointments');
      if (result.success && result.data) {
        const appointmentsArray = Object.keys(result.data).map(key => ({
          id: key,
          ...result.data[key]
        }));
        
        // Filter appointments for the current doctor
        const doctorAppointments = appointmentsArray.filter(apt => 
          apt.doctor === userProfile?.displayName || apt.doctor === userProfile?.name
        );
        
        // Filter for today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = doctorAppointments.filter(apt => apt.date === today);
        
        setAppointments(todayAppointments);
        setFilteredAppointments(todayAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
    setLoading(false);
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await updateRecord(`appointments/${appointmentId}`, {
        status: 'confirmed',
        confirmedAt: Date.now(),
        confirmedBy: userProfile?.displayName || userProfile?.name
      });
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'confirmed', confirmedAt: Date.now(), confirmedBy: userProfile?.displayName || userProfile?.name }
          : apt
      ));
      setFilteredAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'confirmed', confirmedAt: Date.now(), confirmedBy: userProfile?.displayName || userProfile?.name }
          : apt
      ));
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment. Please try again.');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await updateRecord(`appointments/${appointmentId}`, {
        status: 'cancelled',
        cancelledAt: Date.now(),
        cancelledBy: userProfile?.displayName || userProfile?.name
      });
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled', cancelledAt: Date.now(), cancelledBy: userProfile?.displayName || userProfile?.name }
          : apt
      ));
      setFilteredAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled', cancelledAt: Date.now(), cancelledBy: userProfile?.displayName || userProfile?.name }
          : apt
      ));
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    try {
      const prescriptionData = {
        appointmentId: selectedAppointment.id,
        patientName: selectedAppointment.patient,
        doctorName: userProfile?.displayName || userProfile?.name,
        doctorId: userProfile?.staffId,
        date: new Date().toISOString().split('T')[0],
        ...prescription,
        createdAt: Date.now()
      };
      
      await createRecord('prescriptions', prescriptionData);
      
      // Update appointment with prescription status
      await updateRecord(`appointments/${selectedAppointment.id}`, {
        hasPrescription: true,
        prescriptionDate: new Date().toISOString().split('T')[0]
      });
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, hasPrescription: true, prescriptionDate: new Date().toISOString().split('T')[0] }
          : apt
      ));
      setFilteredAppointments(prev => prev.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, hasPrescription: true, prescriptionDate: new Date().toISOString().split('T')[0] }
          : apt
      ));
      
      setShowPrescriptionModal(false);
      setSelectedAppointment(null);
      setPrescription({
        diagnosis: '',
        medications: '',
        instructions: '',
        followUp: ''
      });
      
      alert('Prescription added successfully!');
    } catch (error) {
      console.error('Error adding prescription:', error);
      alert('Failed to add prescription. Please try again.');
    }
  };


  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-scheduled';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return 'Scheduled';
    }
  };

  return (
    <div className="doctor-appointments-page">
      <div className="page-header">
        <div className="header-content">
          <h1>My Appointments</h1>
          <p className="welcome-message">
            Welcome, Dr. {userProfile?.displayName || userProfile?.name || user?.displayName || user?.email}
          </p>
        </div>
      </div>

      <div className="appointments-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No appointments for today</h3>
            <p>You have no scheduled appointments for today. Check back later or contact the admin for new assignments.</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <div className="appointment-time">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {appointment.time}
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                
                <div className="appointment-details">
                  <div className="patient-info">
                    <div className="patient-avatar">
                      {appointment.patient?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div className="patient-details">
                      <h4>{appointment.patient}</h4>
                      <p>Room: {appointment.room}</p>
                    </div>
                  </div>
                  
                  <div className="appointment-info">
                    <p><strong>Department:</strong> {appointment.department}</p>
                    {appointment.notes && (
                      <p><strong>Notes:</strong> {appointment.notes}</p>
                    )}
                  </div>
                </div>
                
                <div className="appointment-actions">
                  {appointment.status === 'scheduled' && (
                    <>
                      <button
                        className="action-btn confirm-btn"
                        onClick={() => handleConfirmAppointment(appointment.id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="action-btn cancel-btn"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {appointment.status === 'confirmed' && !appointment.hasPrescription && (
                    <button
                      className="action-btn prescription-btn"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowPrescriptionModal(true);
                      }}
                    >
                      Add Prescription
                    </button>
                  )}
                  
                  {appointment.hasPrescription && (
                    <span className="prescription-status">
                      ✓ Prescription Added
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Prescription</h3>
              <button
                className="modal-close"
                onClick={() => setShowPrescriptionModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddPrescription} className="prescription-form">
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  value={selectedAppointment.patient}
                  readOnly
                  className="readonly-input"
                />
              </div>
              
              <div className="form-group">
                <label>Diagnosis</label>
                <textarea
                  value={prescription.diagnosis}
                  onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows="3"
                  placeholder="Enter diagnosis..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Medications</label>
                <textarea
                  value={prescription.medications}
                  onChange={(e) => setPrescription(prev => ({ ...prev, medications: e.target.value }))}
                  rows="3"
                  placeholder="Enter medications and dosages..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Instructions</label>
                <textarea
                  value={prescription.instructions}
                  onChange={(e) => setPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                  rows="3"
                  placeholder="Enter patient instructions..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Follow-up</label>
                <textarea
                  value={prescription.followUp}
                  onChange={(e) => setPrescription(prev => ({ ...prev, followUp: e.target.value }))}
                  rows="2"
                  placeholder="Enter follow-up instructions..."
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowPrescriptionModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Add Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default DoctorAppointments;
