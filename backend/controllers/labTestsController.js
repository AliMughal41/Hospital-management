const LabTest = require('../models/LabTest');

// Get all lab tests
const getAllLabTests = async (req, res) => {
  try {
    const labTests = await LabTest.find()
      .populate('patient', 'name email')
      .populate('technician', 'name');
    
    res.json({
      success: true,
      data: labTests,
      message: 'Lab tests retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving lab tests',
      error: error.message
    });
  }
};

// Get lab test by ID
const getLabTestById = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('technician', 'name');
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    res.json({
      success: true,
      data: labTest,
      message: 'Lab test retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving lab test',
      error: error.message
    });
  }
};

// Create new lab test
const createLabTest = async (req, res) => {
  try {
    const labTest = new LabTest(req.body);
    const savedLabTest = await labTest.save();
    
    const populatedLabTest = await LabTest.findById(savedLabTest._id)
      .populate('patient', 'name email')
      .populate('technician', 'name');
    
    res.status(201).json({
      success: true,
      data: populatedLabTest,
      message: 'Lab test created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating lab test',
      error: error.message
    });
  }
};

// Update lab test
const updateLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patient', 'name email')
     .populate('technician', 'name');
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    res.json({
      success: true,
      data: labTest,
      message: 'Lab test updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating lab test',
      error: error.message
    });
  }
};

// Delete lab test
const deleteLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndDelete(req.params.id);
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Lab test deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lab test',
      error: error.message
    });
  }
};

// Get lab tests by patient
const getLabTestsByPatient = async (req, res) => {
  try {
    const labTests = await LabTest.find({ patient: req.params.patientId })
      .populate('patient', 'name email')
      .populate('technician', 'name');
    
    res.json({
      success: true,
      data: labTests,
      message: 'Patient lab tests retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient lab tests',
      error: error.message
    });
  }
};

// Get lab tests by technician
const getLabTestsByTechnician = async (req, res) => {
  try {
    const labTests = await LabTest.find({ technician: req.params.technicianId })
      .populate('patient', 'name email')
      .populate('technician', 'name');
    
    res.json({
      success: true,
      data: labTests,
      message: 'Technician lab tests retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving technician lab tests',
      error: error.message
    });
  }
};

// Get lab test statistics
const getLabTestStats = async (req, res) => {
  try {
    const totalTests = await LabTest.countDocuments();
    const pendingTests = await LabTest.countDocuments({ status: 'pending' });
    const completedTests = await LabTest.countDocuments({ status: 'completed' });
    const testsThisMonth = await LabTest.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      success: true,
      data: {
        totalTests,
        pendingTests,
        completedTests,
        testsThisMonth
      },
      message: 'Lab test statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving lab test statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllLabTests,
  getLabTestById,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  getLabTestsByPatient,
  getLabTestsByTechnician,
  getLabTestStats
};
