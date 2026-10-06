const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const classRoutes = require('./routes/classes');
const attendanceRoutes = require('./routes/attendance');
const graduationRoutes = require('./routes/graduations');
const physicalRoutes = require('./routes/physical');
const tutorialRoutes = require('./routes/tutorials');
const reportRoutes = require('./routes/reports');
const tournamentRoutes = require('./routes/tournaments');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database and seed initial data
initDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/graduations', graduationRoutes);
app.use('/api/physical', physicalRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tournaments', tournamentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Arte Suave API', time: new Date().toISOString() });
});

// Serve frontend build in production if available
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Fallback for SPA
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(clientBuildPath, 'index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send('🥋 Arte Suave API running. Start the Vite client for frontend.');
      }
    });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🥋 Arte Suave Server running at http://localhost:${PORT}`);
});
