const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
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

// Process crash protection
process.on('uncaughtException', (err) => {
  console.error('⚠️ [Segurança] Erro não capturado interceptado:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ [Segurança] Promessa rejeitada interceptada:', reason);
});

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By'); // Hide Express
  next();
});

// Middleware
app.use(compression());
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
  res.json({
    status: 'ok',
    name: 'Arte Suave API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build in production with aggressive caching for hashed assets
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

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

// Global Error Shield Middleware
app.use((err, req, res, next) => {
  console.error('❌ Erro na requisição:', err.message);
  res.status(500).json({ error: 'Ocorreu um erro interno seguro no servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🥋 Arte Suave Server running at http://0.0.0.0:${PORT} (Seguro e Ativo)`);
});
