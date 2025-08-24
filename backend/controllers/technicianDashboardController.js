// Technician Dashboard Controller
// This controller handles all technician-specific dashboard data and operations

// Mock data for demonstration (in real app, this would come from database)
const mockData = {
  technicians: [
    {
      id: 1,
      name: 'Mike Chen',
      email: 'mike.chen@hospital.com',
      department: 'Laboratory',
      shiftStart: '08:00',
      shiftEnd: '16:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      specialization: 'Blood Tests & Biochemistry',
      experience: '6 years',
      certifications: ['MLT', 'Phlebotomy']
    },
    {
      id: 2,
      name: 'Lisa Rodriguez',
      email: 'lisa.rodriguez@hospital.com',
      department: 'Laboratory',
      shiftStart: '16:00',
      shiftEnd: '00:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      specialization: 'Microbiology & Immunology',
      experience: '4 years',
      certifications: ['MLT', 'Microbiology']
    }
  ],
  labTests: [
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 1,
      testType: 'Complete Blood Count (CBC)',
      status: 'pending',
      scheduledDate: '2024-01-15',
      priority: 'routine',
      technician: 'Mike Chen',
      notes: 'Fasting required, collect in morning',
      estimatedDuration: '2 hours'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      patientId: 2,
      testType: 'Blood Chemistry Panel',
      status: 'in_progress',
      scheduledDate: '2024-01-15',
      priority: 'urgent',
      technician: 'Mike Chen',
      notes: 'Collect immediately',
      estimatedDuration: '3 hours',
      startedAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 3,
      patientName: 'Bob Wilson',
      patientId: 3,
      testType: 'Urine Analysis',
      status: 'completed',
      scheduledDate: '2024-01-15',
      priority: 'routine',
      technician: 'Lisa Rodriguez',
      notes: 'First morning urine',
      estimatedDuration: '1 hour',
      startedAt: new Date(Date.now() - 7200000).toISOString(),
      completedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  equipment: [
    {
      id: 1,
      name: 'Centrifuge XR-2000',
      status: 'operational',
      lastMaintenance: '2024-01-01',
      nextMaintenance: '2024-02-01',
      location: 'Lab Room 1'
    },
    {
      id: 2,
      name: 'Microscope Olympus BX53',
      status: 'operational',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-02-05',
      location: 'Lab Room 2'
    }
  ]
};

// Get technician profile information
const getTechnicianProfile = async (req, res) => {
  try {
    const technicianId = req.user.userId; // From JWT token
    const technicianEmail = req.user.email; // From JWT token
    
    // In a real application, this would query the database
    const technician = mockData.technicians.find(t => 
      t.email === technicianEmail || t.id === technicianId
    );
    
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found'
      });
    }
    
    res.json({
      success: true,
      data: technician,
      message: 'Technician profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting technician profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving technician profile',
      error: error.message
    });
  }
};

// Get today's lab tests for the technician
const getTodayLabTests = async (req, res) => {
  try {
    const technicianId = req.user.userId;
    const technicianEmail = req.user.email;
    const technicianName = req.user.name;
    
    // In a real application, this would query the database
    const technician = mockData.technicians.find(t => 
      t.email === technicianEmail || t.id === technicianId || t.name === technicianName
    );
    
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayTests = mockData.labTests.filter(test => 
      test.scheduledDate === today && test.technician === technician.name
    );
    
    res.json({
      success: true,
      data: todayTests,
      message: 'Today\'s lab tests retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting today lab tests:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving today\'s lab tests',
      error: error.message
    });
  }
};

// Get lab test statistics for the technician
const getLabTestStats = async (req, res) => {
  try {
    const technicianId = req.user.userId;
    const technicianEmail = req.user.email;
    const technicianName = req.user.name;
    
    // In a real application, this would query the database
    const technician = mockData.technicians.find(t => 
      t.email === technicianEmail || t.id === technicianId || t.name === technicianName
    );
    
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }
    
    const technicianTests = mockData.labTests.filter(test => test.technician === technician.name);
    const today = new Date().toISOString().split('T')[0];
    const todayTests = technicianTests.filter(test => test.scheduledDate === today);
    
    const stats = {
      totalToday: todayTests.length,
      pendingToday: todayTests.filter(test => test.status === 'pending').length,
      inProgressToday: todayTests.filter(test => test.status === 'in_progress').length,
      completedToday: todayTests.filter(test => test.status === 'completed').length,
      totalThisWeek: technicianTests.filter(test => {
        const testDate = new Date(test.scheduledDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return testDate >= weekAgo;
      }).length,
      averageCompletionTime: '2.5 hours'
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Lab test statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting lab test stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving lab test statistics',
      error: error.message
    });
  }
};

// Get working schedule for the technician
const getWorkingSchedule = async (req, res) => {
  try {
    const technicianId = req.user.userId;
    const technicianEmail = req.user.email;
    
    // In a real application, this would query the database
    const technician = mockData.technicians.find(t => 
      t.email === technicianEmail || t.id === technicianId
    );
    
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }
    
    const schedule = {
      shiftStart: technician.shiftStart,
      shiftEnd: technician.shiftEnd,
      workingDays: technician.workingDays,
      department: technician.department,
      specialization: technician.specialization,
      experience: technician.experience,
      certifications: technician.certifications
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

// Get equipment status for the technician
const getEquipmentStatus = async (req, res) => {
  try {
    const equipment = mockData.equipment.map(eq => ({
      id: eq.id,
      name: eq.name,
      status: eq.status,
      lastMaintenance: eq.lastMaintenance,
      nextMaintenance: eq.nextMaintenance,
      location: eq.location,
      needsMaintenance: new Date(eq.nextMaintenance) <= new Date()
    }));
    
    res.json({
      success: true,
      data: equipment,
      message: 'Equipment status retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting equipment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving equipment status',
      error: error.message
    });
  }
};

module.exports = {
  getTechnicianProfile,
  getTodayLabTests,
  getLabTestStats,
  getWorkingSchedule,
  getEquipmentStatus
};
