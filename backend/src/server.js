const express = require('express');
const cors = require('cors');
const { sequelize } = require('../models');
const { ErrorHandler } = require('./middlewares/errorHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');
const serviceTypeRoutes = require('./routes/serviceTypeRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const gardenDetailRoutes = require('./routes/gardenDetailRoutes');
const buildingDetailRoutes = require('./routes/buildingDetailRoutes');

const app = express();
const PORT = 5000;
const API_PREFIX = '/api';

// ============================================
// CORS CONFIGURATION - Allow your frontend
// ============================================
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite default port
    'http://localhost:3000',  // React default port
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ============================================
// ROUTES
// ============================================
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/service-types`, serviceTypeRoutes);
app.use(`${API_PREFIX}/availability`, availabilityRoutes);
app.use(`${API_PREFIX}/bookings`, bookingRoutes);
app.use(`${API_PREFIX}/garden-details`, gardenDetailRoutes);
app.use(`${API_PREFIX}/building-details`, buildingDetailRoutes);

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
      users: `${API_PREFIX}/users`,
      serviceTypes: `${API_PREFIX}/service-types`,
      availability: `${API_PREFIX}/availability`,
      bookings: `${API_PREFIX}/bookings`,
      gardenDetails: `${API_PREFIX}/garden-details`,
      buildingDetails: `${API_PREFIX}/building-details`,
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
  console.log(`📡 API prefix: ${API_PREFIX}`);
  console.log(`🔗 CORS allowed origins: http://localhost:5173, http://localhost:3000`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
});