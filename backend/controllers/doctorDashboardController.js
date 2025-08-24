// Doctor Dashboard Controller
// This controller handles all doctor-specific dashboard data and operations

// Mock data for demonstration (in real app, this would come from database)
const mockData = {
  doctors: [
    {
      id: 1,
      name: 'Dr. John Smith',
      email: 'john.smith@hospital.com',
      department: 'Cardiology',
      shiftStart: '09:00',
      shiftEnd: '17:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      specialization: 'Cardiologist',
      experience: '15 years'
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@hospital.com',
      department: 'Neurology',
      shiftStart: '08:00',
      shiftEnd: '16:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      specialization: 'Neurologist',
      experience: '12 years'
    }
  ],
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
      notes: 'Follow-up consultation'
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
      notes: 'Routine checkup'
    }
  ],
  prescriptions: [
    {
      id: 1,
      appointmentId: 1,
      patientName: 'John Doe',
      doctorName: 'Dr. John Smith',
      diagnosis: 'Hypertension',
      medications: 'Lisinopril 10mg daily',
      instructions: 'Take medication in the morning, monitor blood pressure',
      followUp: '2 weeks',
      date: '2024-01-15'
    }
  ]
};

// Get doctor profile information
const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.userId; // From JWT token
    const doctorEmail = req.user.email; // From JWT token
    
    // In a real application, this would query the database
    const doctor = mockData.doctors.find(d => 
      d.email === doctorEmail || d.id === doctorId
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    res.json({
      success: true,
      data: doctor,
      message: 'Doctor profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting doctor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving doctor profile',
      error: error.message
    });
  }
};

// Get doctor's today appointments
const getTodayAppointments = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const doctor = mockData.doctors.find(d => 
      d.email === doctorEmail || d.id === doctorId || d.name === doctorName
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = mockData.appointments.filter(apt => 
      apt.doctor === doctor.name && apt.date === today
    );
    
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

// Get doctor's appointment statistics
const getAppointmentStats = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const doctor = mockData.doctors.find(d => 
      d.email === doctorEmail || d.id === doctorId || d.name === doctorName
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    const doctorAppointments = mockData.appointments.filter(apt => 
      apt.doctor === doctor.name
    );
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = doctorAppointments.filter(apt => apt.date === today);
    
    const stats = {
      totalToday: todayAppointments.length,
      confirmedToday: todayAppointments.filter(apt => apt.status === 'confirmed').length,
      completedToday: todayAppointments.filter(apt => apt.status === 'completed').length,
      pendingToday: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      totalThisWeek: doctorAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return aptDate >= weekAgo;
      }).length
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Appointment statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointment statistics',
      error: error.message
    });
  }
};

// Get doctor's working schedule
const getWorkingSchedule = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const doctorEmail = req.user.email;
    const doctorName = req.user.name;
    
    // In a real application, this would query the database
    const doctor = mockData.doctors.find(d => 
      d.email === doctorEmail || d.id === doctorId || d.name === doctorName
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    const schedule = {
      shiftStart: doctor.shiftStart,
      shiftEnd: doctor.shiftEnd,
      workingDays: doctor.workingDays,
      department: doctor.department,
      specialization: doctor.specialization,
      experience: doctor.experience
    };
    
    res.json({
      success: true,
      data: schedule,
      message: 'Working schedule retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting working schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving working schedule',
      error: error.message
    });
  }
};

module.exports = {
  getDoctorProfile,
  getTodayAppointments,
  getAppointmentStats,
  getWorkingSchedule
};
