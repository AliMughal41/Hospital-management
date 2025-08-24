const Staff = require('../models/Staff');

// Get all staff members
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json({
      success: true,
      data: staff,
      message: 'Staff retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving staff',
      error: error.message
    });
  }
};

// Get staff member by ID
const getStaffById = async (req, res) => {
  try {
    const staffMember = await Staff.findById(req.params.id);
    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    res.json({
      success: true,
      data: staffMember,
      message: 'Staff member retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving staff member',
      error: error.message
    });
  }
};

// Create new staff member
const createStaff = async (req, res) => {
  try {
    const staffMember = new Staff(req.body);
    const savedStaff = await staffMember.save();
    res.status(201).json({
      success: true,
      data: savedStaff,
      message: 'Staff member created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating staff member',
      error: error.message
    });
  }
};

// Update staff member
const updateStaff = async (req, res) => {
  try {
    const staffMember = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    res.json({
      success: true,
      data: staffMember,
      message: 'Staff member updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating staff member',
      error: error.message
    });
  }
};

// Delete staff member
const deleteStaff = async (req, res) => {
  try {
    const staffMember = await Staff.findByIdAndDelete(req.params.id);
    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting staff member',
      error: error.message
    });
  }
};

// Get staff by role
const getStaffByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const staff = await Staff.find({ role: role });
    res.json({
      success: true,
      data: staff,
      message: `Staff with role ${role} retrieved successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving staff by role',
      error: error.message
    });
  }
};

// Get staff statistics
const getStaffStats = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const doctors = await Staff.countDocuments({ role: 'doctor' });
    const nurses = await Staff.countDocuments({ role: 'nurse' });
    const technicians = await Staff.countDocuments({ role: 'technician' });
    const receptionists = await Staff.countDocuments({ role: 'receptionist' });

    res.json({
      success: true,
      data: {
        totalStaff,
        doctors,
        nurses,
        technicians,
        receptionists
      },
      message: 'Staff statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving staff statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByRole,
  getStaffStats
};
