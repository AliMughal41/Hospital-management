// Receptionist Dashboard Controller
// This controller handles all receptionist-specific dashboard data and operations

// Mock data for demonstration (in real app, this would come from database)
const mockData = {
  receptionists: [
    {
      id: 1,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@hospital.com',
      department: 'Reception',
      shiftStart: '08:00',
      shiftEnd: '16:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      role: 'Senior Receptionist',
      experience: '8 years'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      email: 'mike.johnson@hospital.com',
      department: 'Reception',
      shiftStart: '16:00',
      shiftEnd: '00:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      role: 'Receptionist',
      experience: '3 years'
    }
  ],
  patients: [
    {
      id: 1,
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      phone: '+1234567890',
      email: 'john.doe@email.com',
      address: '123 Main St, City',
      registrationDate: '2024-01-10',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      gender: 'Female',
      phone: '+1234567891',
      email: 'jane.smith@email.com',
      address: '456 Oak Ave, City',
      registrationDate: '2024-01-12',
      status: 'active'
    }
  ],
  appointments: [
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 1,
      doctor: 'Dr. John Smith',
      date: '2024-01-15',
      time: '10:00',
      status: 'scheduled',
      department: 'Cardiology',
      room: '101',
      notes: 'Follow-up consultation'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      patientId: 2,
      doctor: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      time: '11:00',
      status: 'confirmed',
      department: 'Neurology',
      room: '102',
      notes: 'Initial consultation'
    }
  ],
  labTests: [
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 1,
      testType: 'Blood Test',
      status: 'pending',
      scheduledDate: '2024-01-15',
      technician: 'Tech Mike',
      notes: 'Fasting required'
    }
  ],
  bloodBank: [
    {
      id: 1,
      bloodType: 'A+',
      units: 15,
      status: 'available',
      expiryDate: '2024-02-15',
      lastUpdated: '2024-01-10'
    },
    {
      id: 2,
      bloodType: 'O-',
      units: 8,
      status: 'low',
      expiryDate: '2024-02-10',
      lastUpdated: '2024-01-10'
    }
  ]
};

// Get receptionist profile information
const getReceptionistProfile = async (req, res) => {
  try {
    const receptionistId = req.user.userId; // From JWT token
    const receptionistEmail = req.user.email; // From JWT token
    
    // In a real application, this would query the database
    const receptionist = mockData.receptionists.find(r => 
      r.email === receptionistEmail || r.id === receptionistId
    );
    
    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist profile not found'
      });
    }
    
    res.json({
      success: true,
      data: receptionist,
      message: 'Receptionist profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting receptionist profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving receptionist profile',
      error: error.message
    });
  }
};

// Get today's statistics for receptionist
const getTodayStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const todayAppointments = mockData.appointments.filter(apt => apt.date === today);
    const todayLabTests = mockData.labTests.filter(test => test.scheduledDate === today);
    
    const stats = {
      totalAppointments: todayAppointments.length,
      confirmedAppointments: todayAppointments.filter(apt => apt.status === 'confirmed').length,
      pendingAppointments: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      totalLabTests: todayLabTests.length,
      pendingLabTests: todayLabTests.filter(test => test.status === 'pending').length,
      totalPatients: mockData.patients.length,
      availableBloodUnits: mockData.bloodBank.reduce((total, blood) => total + blood.units, 0)
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Today\'s statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting today stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving today\'s statistics',
      error: error.message
    });
  }
};

// Get working schedule for the receptionist
const getWorkingSchedule = async (req, res) => {
  try {
    const receptionistId = req.user.userId;
    const receptionistEmail = req.user.email;
    
    // In a real application, this would query the database
    const receptionist = mockData.receptionists.find(r => 
      r.email === receptionistEmail || r.id === receptionistId
    );
    
    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }
    
    const schedule = {
      shiftStart: receptionist.shiftStart,
      shiftEnd: receptionist.shiftEnd,
      workingDays: receptionist.workingDays,
      department: receptionist.department,
      role: receptionist.role,
      experience: receptionist.experience
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

// Get recent activities for receptionist
const getRecentActivity = async (req, res) => {
  try {
    const recentActivity = [
      {
        id: 1,
        type: 'appointment_created',
        description: 'New appointment scheduled for John Doe',
        timestamp: new Date().toISOString(),
        patientName: 'John Doe',
        doctor: 'Dr. John Smith'
      },
      {
        id: 2,
        type: 'patient_registered',
        description: 'New patient Jane Smith registered',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        patientName: 'Jane Smith'
      },
      {
        id: 3,
        type: 'lab_test_scheduled',
        description: 'Blood test scheduled for John Doe',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        patientName: 'John Doe',
        testType: 'Blood Test'
      }
    ];
    
    res.json({
      success: true,
      data: recentActivity,
      message: 'Recent activity retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving recent activity',
      error: error.message
    });
  }
};

module.exports = {
  getReceptionistProfile,
  getTodayStats,
  getWorkingSchedule,
  getRecentActivity
};
