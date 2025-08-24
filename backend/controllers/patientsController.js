const Patient = require('../models/Patient');

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json({
      success: true,
      data: patients,
      message: 'Patients retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving patients',
      error: error.message
    });
  }
};

// Get patient by ID
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.json({
      success: true,
      data: patient,
      message: 'Patient retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient',
      error: error.message
    });
  }
};

// Create new patient
const createPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    res.status(201).json({
      success: true,
      data: savedPatient,
      message: 'Patient created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating patient',
      error: error.message
    });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.json({
      success: true,
      data: patient,
      message: 'Patient updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
};

// Search patients
const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      success: true,
      data: patients,
      message: 'Patients search completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching patients',
      error: error.message
    });
  }
};

// Get patient statistics
const getPatientStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const newPatientsThisMonth = await Patient.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      success: true,
      data: {
        totalPatients,
        newPatientsThisMonth
      },
      message: 'Patient statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientStats
};
