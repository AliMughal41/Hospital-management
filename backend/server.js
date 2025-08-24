const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import Firebase config (this will handle initialization)
const { admin } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routers
const accountsRouter = require('./routes/accounts');
const appointmentsRouter = require('./routes/appointments');
const bloodbankRouter = require('./routes/bloodbank');
const patientsRouter = require('./routes/patients');
const staffRouter = require('./routes/staff');
const settingsRouter = require('./routes/settings');
const doctorAppointmentsRouter = require('./routes/doctorAppointments');
const labTestsRouter = require('./routes/labTests');
const authRouter = require('./routes/auth');  
const dashboardRouter = require('./routes/dashboard');
const doctorDashboardRouter = require('./routes/doctorDashboard');
const receptionistDashboardRouter = require('./routes/receptionistDashboard');
const technicianDashboardRouter = require('./routes/technicianDashboard');

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 MediSyncX Backend API is running',
    timestamp: new Date().toISOString(),
    firebaseStatus: admin.apps.length > 0 ? 'Connected' : 'Not Connected'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    firebase: admin.apps.length > 0
  });
});

// Mount API routers
app.use('/api/accounts', accountsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/bloodbank', bloodbankRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/doctor-appointments', doctorAppointmentsRouter);
app.use('/api/lab-tests', labTestsRouter);
app.use('/api/auth', authRouter);  
app.use('/api/dashboard', dashboardRouter);
app.use('/api/doctor-dashboard', doctorDashboardRouter);
app.use('/api/receptionist-dashboard', receptionistDashboardRouter);
app.use('/api/technician-dashboard', technicianDashboardRouter);

// 404 handler (for unmatched routes)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must have 4 args)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔥 Firebase Admin: ${admin.apps.length > 0 ? 'Initialized' : 'Not initialized'}`);
});

module.exports = app;