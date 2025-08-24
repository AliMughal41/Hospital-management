// Doctor Appointments Controller
// This controller handles all doctor-specific appointment operations

// Mock data for demonstration (in real app, this would come from database)
const mockData = {
  appointments: [
    {
      id: 1,
      patient: 'John Doe',
      doctor: 'Dr. John Smith',
      date: '2024-01-15',
      time: '10:00',
      status: 'confirmed',
      department: 'Cardiology',
      room: '101',
      notes: 'Follow-up consultation',
      confirmedAt: 1705312800000,
      confirmedBy: 'Dr. John Smith'
    },
    {
      id: 2,
      patient: 'Jane Smith',
      doctor: 'Dr. John Smith',
      date: '2024-01-15',
      time: '11:00',
      status: 'scheduled',
      department: 'Cardiology',
      room: '101',
      notes: 'Initial consultation'
    },
    {
      id: 3,
      patient: 'Bob Wilson',
      doctor: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      time: '09:00',
      status: 'completed',
      department: 'Neurology',
      room: '102',
      notes: 'Routine checkup',
      completedAt: 1705309200000
    }
  ],
  prescriptions: [
    {
      id: 1,
      appointmentId: 1,
      patientName: 'John Doe',
      doctorName: 'Dr. John Smith',
      doctorId: 'DR001',
      diagnosis: 'Hypertension',
      medications: 'Lisinopril 10mg daily',
      instructions: 'Take medication in the morning, monitor blood pressure',
      followUp: '2 weeks',
      date: '2024-01-15',
      createdAt: 1705312800000
    }
  ],
  expenses: [
    {
      id: 1,
      description: 'Doctor Salary',
      category: 'SALARY',
      amount: 5000.00,
      date: '2024-01-15',
      paymentMethod: 'Bank Transfer',
      vendor: 'Dr. John Smith',
      doctorId: 'DR001',
      createdAt: 1705312800000,
      updatedAt: 1705312800000
    }
  ]
};

// Get all appointments for a specific doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const doctorAppointments = mockData.appointments.filter(apt => 
      apt.doctor === doctorName || apt.doctor === `Dr. ${doctorName}`
    );
    
    res.json({
      success: true,
      data: doctorAppointments,
      message: 'Doctor appointments retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving doctor appointments',
      error: error.message
    });
  }
};

// Get today's appointments for a specific doctor
const getTodayAppointments = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const doctorAppointments = mockData.appointments.filter(apt => 
      apt.doctor === doctorName || apt.doctor === `Dr. ${doctorName}`
    );
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = doctorAppointments.filter(apt => apt.date === today);
    
    res.json({
      success: true,
      data: todayAppointments,
      message: 'Today\'s appointments retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting today appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving today appointments',
      error: error.message
    });
  }
};

// Confirm an appointment
const confirmAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const appointment = mockData.appointments.find(apt => apt.id === parseInt(appointmentId));
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if the doctor is authorized to confirm this appointment
    if (appointment.doctor !== doctorName && appointment.doctor !== `Dr. ${doctorName}`) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to confirm this appointment'
      });
    }
    
    // Update appointment status
    appointment.status = 'confirmed';
    appointment.confirmedAt = Date.now();
    appointment.confirmedBy = doctorName;
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming appointment',
      error: error.message
    });
  }
};

// Cancel an appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const appointment = mockData.appointments.find(apt => apt.id === parseInt(appointmentId));
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if the doctor is authorized to cancel this appointment
    if (appointment.doctor !== doctorName && appointment.doctor !== `Dr. ${doctorName}`) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this appointment'
      });
    }
    
    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancelledAt = Date.now();
    appointment.cancelledBy = doctorName;
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

// Complete an appointment
const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const appointment = mockData.appointments.find(apt => apt.id === parseInt(appointmentId));
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if the doctor is authorized to complete this appointment
    if (appointment.doctor !== doctorName && appointment.doctor !== `Dr. ${doctorName}`) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this appointment'
      });
    }
    
    // Update appointment status
    appointment.status = 'completed';
    appointment.completedAt = Date.now();
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment completed successfully'
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing appointment',
      error: error.message
    });
  }
};

// Add prescription for an appointment
const addPrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const prescriptionData = req.body;
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const appointment = mockData.appointments.find(apt => apt.id === parseInt(appointmentId));
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if the doctor is authorized to add prescription for this appointment
    if (appointment.doctor !== doctorName && appointment.doctor !== `Dr. ${doctorName}`) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add prescription for this appointment'
      });
    }
    
    // Create new prescription
    const newPrescription = {
      id: mockData.prescriptions.length + 1,
      appointmentId: parseInt(appointmentId),
      patientName: appointment.patient,
      doctorName: doctorName,
      doctorId: doctorId,
      date: new Date().toISOString().split('T')[0],
      ...prescriptionData,
      createdAt: Date.now()
    };
    
    mockData.prescriptions.push(newPrescription);
    
    // Update appointment with prescription status
    appointment.hasPrescription = true;
    appointment.prescriptionDate = new Date().toISOString().split('T')[0];
    
    res.status(201).json({
      success: true,
      data: newPrescription,
      message: 'Prescription added successfully'
    });
  } catch (error) {
    console.error('Error adding prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding prescription',
      error: error.message
    });
  }
};

// Add salary record
const addSalaryRecord = async (req, res) => {
  try {
    const salaryData = req.body;
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // Create new salary record
    const newSalaryRecord = {
      id: mockData.expenses.length + 1,
      description: salaryData.notes || 'Doctor Salary',
      category: 'SALARY',
      amount: parseFloat(salaryData.amount),
      date: salaryData.date,
      paymentMethod: 'Bank Transfer',
      vendor: doctorName,
      doctorId: doctorId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    mockData.expenses.push(newSalaryRecord);
    
    res.status(201).json({
      success: true,
      data: newSalaryRecord,
      message: 'Salary record added successfully'
    });
  } catch (error) {
    console.error('Error adding salary record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding salary record',
      error: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const appointment = mockData.appointments.find(apt => apt.id === parseInt(appointmentId));
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if the doctor is authorized to view this appointment
    if (appointment.doctor !== doctorName && appointment.doctor !== `Dr. ${doctorName}`) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this appointment'
      });
    }
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointment',
      error: error.message
    });
  }
};

module.exports = {
  getDoctorAppointments,
  getTodayAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  addPrescription,
  addSalaryRecord,
  getAppointmentById
};
