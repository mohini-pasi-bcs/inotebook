const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Connect to MongoDB - Use correct database name
mongoose.connect('mongodb://127.0.0.1:27017/inotebook')
.then(() => console.log('MongoDB connected successfully to inotebook database'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: 'inotebook',
    port: PORT
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: `Route ${req.originalUrl} not found` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: inotebook`);
  console.log(`Available routes:`);
  console.log(`  POST   http://localhost:${PORT}/api/auth/register`);
  console.log(`  POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`  GET    http://localhost:${PORT}/api/notes`);
  console.log(`  POST   http://localhost:${PORT}/api/notes`);
  console.log(`  PUT    http://localhost:5000/api/notes/:id`);
  console.log(`  DELETE http://localhost:5000/api/notes/:id`);
  console.log(`  GET    http://localhost:5000/health`);
});