const Account = require('../models/Account');

// Get all accounts
const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json({
      success: true,
      data: accounts,
      message: 'Accounts retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving accounts',
      error: error.message
    });
  }
};

// Get account by ID
const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    res.json({
      success: true,
      data: account,
      message: 'Account retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving account',
      error: error.message
    });
  }
};

// Create new account
const createAccount = async (req, res) => {
  try {
    const account = new Account(req.body);
    const savedAccount = await account.save();
    res.status(201).json({
      success: true,
      data: savedAccount,
      message: 'Account created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
};

// Update account
const updateAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    res.json({
      success: true,
      data: account,
      message: 'Account updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating account',
      error: error.message
    });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

module.exports = {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};
