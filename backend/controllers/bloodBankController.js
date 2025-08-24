const BloodBank = require('../models/BloodBank');

// Get all blood bank records
const getAllBloodBankRecords = async (req, res) => {
  try {
    const bloodRecords = await BloodBank.find();
    res.json({
      success: true,
      data: bloodRecords,
      message: 'Blood bank records retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving blood bank records',
      error: error.message
    });
  }
};

// Get blood bank record by ID
const getBloodBankRecordById = async (req, res) => {
  try {
    const bloodRecord = await BloodBank.findById(req.params.id);
    if (!bloodRecord) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank record not found'
      });
    }
    res.json({
      success: true,
      data: bloodRecord,
      message: 'Blood bank record retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving blood bank record',
      error: error.message
    });
  }
};

// Create new blood bank record
const createBloodBankRecord = async (req, res) => {
  try {
    const bloodRecord = new BloodBank(req.body);
    const savedRecord = await bloodRecord.save();
    res.status(201).json({
      success: true,
      data: savedRecord,
      message: 'Blood bank record created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating blood bank record',
      error: error.message
    });
  }
};

// Update blood bank record
const updateBloodBankRecord = async (req, res) => {
  try {
    const bloodRecord = await BloodBank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bloodRecord) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank record not found'
      });
    }
    res.json({
      success: true,
      data: bloodRecord,
      message: 'Blood bank record updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating blood bank record',
      error: error.message
    });
  }
};

// Delete blood bank record
const deleteBloodBankRecord = async (req, res) => {
  try {
    const bloodRecord = await BloodBank.findByIdAndDelete(req.params.id);
    if (!bloodRecord) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank record not found'
      });
    }
    res.json({
      success: true,
      message: 'Blood bank record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blood bank record',
      error: error.message
    });
  }
};

// Get blood inventory summary
const getBloodInventorySummary = async (req, res) => {
  try {
    const summary = await BloodBank.aggregate([
      {
        $group: {
          _id: '$bloodType',
          totalUnits: { $sum: '$units' },
          averagePrice: { $avg: '$pricePerUnit' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: summary,
      message: 'Blood inventory summary retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving blood inventory summary',
      error: error.message
    });
  }
};

// Get low stock alerts
const getLowStockAlerts = async (req, res) => {
  try {
    const lowStock = await BloodBank.find({ units: { $lt: 10 } });
    res.json({
      success: true,
      data: lowStock,
      message: 'Low stock alerts retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving low stock alerts',
      error: error.message
    });
  }
};

module.exports = {
  getAllBloodBankRecords,
  getBloodBankRecordById,
  createBloodBankRecord,
  updateBloodBankRecord,
  deleteBloodBankRecord,
  getBloodInventorySummary,
  getLowStockAlerts
};
