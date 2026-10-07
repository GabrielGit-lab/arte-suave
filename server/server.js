const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Serve frontend build in production with dynamic Open Graph tags
const clientBuildPath = path.join(__dirname, '../client/dist');

function sendEnrichedIndexHtml(req, res) {
  const indexPath = path.join(clientBuildPath, 'index.html');
  fs.readFile(indexPath, 'utf8', (err, html) => {
    if (err) {
      return res.status(200).send('🥋 Arte Suave API running. Inicie o cliente Vite.');
    }
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:5000';
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    const fullUrl = `${proto}://${host}${req.originalUrl || '/'}`;
    const fullImageUrl = `${proto}://${host}/artesuave-preview-v2.jpg?v=2`;
    const currentTime = Math.floor(Date.now() / 1000).toString();

    const enrichedHtml = html
      .replace(/__OG_IMAGE_URL__/g, fullImageUrl)
      .replace(/__OG_PAGE_URL__/g, fullUrl)
      .replace(/__OG_UPDATED_TIME__/g, currentTime);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(enrichedHtml);
  });
}

// Intercept root and direct index requests for dynamic Open Graph
app.get('/', (req, res) => sendEnrichedIndexHtml(req, res));
app.get('/index.html', (req, res) => sendEnrichedIndexHtml(req, res));

// Serve frontend assets (CSS, JS, images)
app.use(express.static(clientBuildPath, {
  maxAge: '1y',
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.png') || filePath.endsWith('.svg') || filePath.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
    return sendEnrichedIndexHtml(req, res);
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
