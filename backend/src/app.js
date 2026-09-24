const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./routes');
const errorHandler = require('./utils/errorHandler');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets (prefer frontend/dist if built, fallback to backend/public/)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
} else {
  app.use(express.static(path.join(__dirname, '../public')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Trader Simulation Engine',
    timestamp: new Date(),
  });
});

// Mount API Routes
app.use('/api', apiRoutes);

// SPA fallback middleware for client-side routing
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }

  if (fs.existsSync(frontendDistPath)) {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
  return res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
