require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('../models');
const { ErrorHandler } = require('./middlewares/errorHandler');

// Import routes directly
const userRoutes = require('./routes/userRoutes');
const serviceTypeRoutes = require('./routes/serviceTypeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Each connected separately
app.use('/api/users', userRoutes);
app.use('/api/service-types', serviceTypeRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Cleaning Service API',
    endpoints: {
      users: '/api/users',
      serviceTypes: '/api/service-types',
      health: '/health'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use(ErrorHandler.handleError);

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
});