/**
 * E-CYCLE Backend Server
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  console.error('\n❌ FATAL: JWT_SECRET is not set in your .env file!\n');
  process.exit(1);
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const app = express();
const server = http.createServer(app);

// ── Socket.IO setup ──────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => cb(null, true),
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.set('io', io);

// ── MongoDB connection ───────────────────────────────────
connectDB();

// ── Trust proxy (Render) ─────────────────────────────────
app.set('trust proxy', 1);

// ── Middleware ───────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev', {
    skip: (req) =>
      req.url.includes('hot-update') ||
      req.url === '/favicon.ico'
  }));
}

// ── Silence browser noise ────────────────────────────────
app.use((req, res, next) => {
  if (
    req.url.includes('hot-update') ||
    ['/favicon.ico', '/logo192.png', '/logo512.png', '/manifest.json'].includes(req.url)
  ) return res.status(204).end();
  next();
});

// ── Rate limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 500 : 2000,
  validate: { xForwardedForHeader: false }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 500,
  validate: { xForwardedForHeader: false }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ── API Routes ───────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'E-CYCLE API running' })
);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/recycle', require('./routes/recycle'));
app.use('/api/centers', require('./routes/centers'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/rewards', require('./routes/rewards'));

// ✅ ROOT ROUTE (FIX FOR RENDER)
app.get('/', (req, res) => {
  res.send('🚀 E-CYCLE Backend is Live on Render');
});

// ── 404 handler ──────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ error: 'Route not found' })
);

// ── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
  });
});

// ── Socket.IO events ─────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on('join_admin', () => {
    socket.join('admin_room');
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ── Start server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 E-CYCLE Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API: http://localhost:${PORT}/api\n`);
});