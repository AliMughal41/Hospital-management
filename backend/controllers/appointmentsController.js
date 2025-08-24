const Appointment = require('../models/Appointment');

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    
    res.json({
      success: true,
      data: appointments,
      message: 'Appointments retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointments',
      error: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointment',
      error: error.message
    });
  }
};

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();
    
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    
    res.status(201).json({
      success: true,
      data: populatedAppointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patient', 'name email')
     .populate('doctor', 'name specialization');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message
    });
  }
};

// Get appointments by doctor
const getAppointmentsByDoctor = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.doctorId })
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    
    res.json({
      success: true,
      data: appointments,
      message: 'Doctor appointments retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving doctor appointments',
      error: error.message
    });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDoctor
};
