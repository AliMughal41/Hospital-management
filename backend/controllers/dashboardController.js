// Dashboard Statistics Controller
// This controller handles all dashboard-related data aggregation and statistics

// Mock data for demonstration (in real app, this would come from database)
const mockData = {
  patients: [
    { id: 1, name: 'John Doe', status: 'active' },
    { id: 2, name: 'Jane Smith', status: 'active' },
    { id: 3, name: 'Bob Johnson', status: 'inactive' }
  ],
  appointments: [
    { id: 1, patientId: 1, date: '2024-01-15', status: 'scheduled' },
    { id: 2, patientId: 2, date: '2024-01-16', status: 'completed' },
    { id: 3, patientId: 3, date: '2024-01-17', status: 'scheduled' }
  ],
  labTests: [
    { id: 1, patientId: 1, testType: 'Blood Test', status: 'completed' },
    { id: 2, patientId: 2, testType: 'Urine Test', status: 'pending' },
    { id: 3, patientId: 1, testType: 'X-Ray', status: 'completed' }
  ],
  bloodBank: [
    { id: 1, bloodType: 'A+', units: 15, status: 'available' },
    { id: 2, bloodType: 'B+', units: 8, status: 'available' },
    { id: 3, bloodType: 'O+', units: 25, status: 'available' },
    { id: 4, bloodType: 'AB+', units: 5, status: 'available' }
  ]
};

// Get total patients count
const getTotalPatients = async (req, res) => {
  try {
    // In a real application, this would query the database
    const totalPatients = mockData.patients.filter(p => p.status === 'active').length;
    
    res.json({
      success: true,
      count: totalPatients,
      message: 'Total patients count retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting total patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patients count',
      error: error.message
    });
  }
};

// Get total appointments count
const getTotalAppointments = async (req, res) => {
  try {
    // In a real application, this would query the database
    const totalAppointments = mockData.appointments.filter(a => a.status === 'scheduled').length;
    
    res.json({
      success: true,
      count: totalAppointments,
      message: 'Total appointments count retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting total appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointments count',
      error: error.message
    });
  }
};

// Get total lab tests count
const getTotalLabTests = async (req, res) => {
  try {
    // In a real application, this would query the database
    const totalLabTests = mockData.labTests.length;
    
    res.json({
      success: true,
      count: totalLabTests,
      message: 'Total lab tests count retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting total lab tests:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving lab tests count',
      error: error.message
    });
  }
};

// Get total blood bank units
const getTotalBloodBankUnits = async (req, res) => {
  try {
    // In a real application, this would query the database
    const totalUnits = mockData.bloodBank.reduce((sum, blood) => sum + blood.units, 0);
    
    res.json({
      success: true,
      count: totalUnits,
      message: 'Total blood bank units retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting total blood bank units:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving blood bank units count',
      error: error.message
    });
  }
};

// Get all dashboard statistics in one call
const getDashboardStats = async (req, res) => {
  try {
    const activePatients = mockData.patients.filter(p => p.status === 'active').length;
    const scheduledAppointments = mockData.appointments.filter(a => a.status === 'scheduled').length;
    const totalLabTests = mockData.labTests.length;
    const totalBloodUnits = mockData.bloodBank.reduce((sum, blood) => sum + blood.units, 0);
    
    const stats = {
      patients: activePatients,
      appointments: scheduledAppointments,
      labTests: totalLabTests,
      bloodBank: totalBloodUnits
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard statistics',
      error: error.message
    });
  }
};

// Get recent activity for dashboard
const getRecentActivity = async (req, res) => {
  try {
    // In a real application, this would query the database for recent activities
    const recentActivity = [
      {
        id: 1,
        type: 'appointment',
        description: 'New appointment scheduled for John Doe',
        timestamp: new Date().toISOString(),
        status: 'info'
      },
      {
        id: 2,
        type: 'labTest',
        description: 'Lab test results ready for Jane Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'success'
      },
      {
        id: 3,
        type: 'patient',
        description: 'New patient registration: Bob Johnson',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'info'
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
  getTotalPatients,
  getTotalAppointments,
  getTotalLabTests,
  getTotalBloodBankUnits,
  getDashboardStats,
  getRecentActivity
};
