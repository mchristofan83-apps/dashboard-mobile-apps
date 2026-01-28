require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const db = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/validation');
const cloudflareSync = require('./utils/cloudflareSync');
const routes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:4173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }
});

const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:4173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Handle preflight requests
app.options('*', (req, res) => {
  const origin = req.headers.origin || process.env.CORS_ORIGIN || 'http://localhost:4173';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware
app.use(sanitizeInput);


// Production middleware
if (process.env.NODE_ENV === 'production') {
  // Trust proxy for Cloudflare
  app.set('trust proxy', 1);
  
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "wss:", "https:"]
      }
    }
  }));
  
  // Compression
  app.use(compression());
  
  // Request logging
  app.use(morgan('combined', {
    stream: fs.createWriteStream('./logs/access.log', { flags: 'a' })
  }));
}

// Rate limiting middleware
app.use('/api', apiLimiter);

// Serve static files (uploaded images and excel files)
app.use('/uploads', express.static('uploads'));

// Custom headers for Cloudflare integration
app.use((req, res, next) => {
  res.set('X-Server-Time', new Date().toISOString());
  if (process.env.CLOUDFLARE_ENABLED === 'true') {
    res.set('X-Cloudflare-Sync', 'enabled');
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database is already initialized through config/database.js
console.log('Database connected successfully');

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard & Mobile Apps API Server',
    version: '1.0.0',
    cloudflareEnabled: process.env.CLOUDFLARE_ENABLED === 'true',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      outlets: '/api/outlets',
      visits: '/api/visits',
      visitActions: '/api/visit-actions',
      dashboard: '/api/dashboard',
      reports: '/api/reports',
      sync: '/api/sync',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server

// HTTPS Configuration for SSL (disabled for now)
// const https = require('https');
// const fs = require('fs');

// SSL Certificate paths
// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
//   cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
//   secureOptions: require('constants').SSL_OP_NO_SSLv3 | require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1,
//   ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384',
//   honorCipherOrder: true,
//   rejectUnauthorized: false // Allow Cloudflare Origin Certificate
// };

// Create HTTPS server
// const httpsServer = https.createServer(sslOptions, app);

// Start HTTPS server
// httpsServer.listen(8443, () => {
//   console.log('🔒 HTTPS Server running on port 8443');
//   console.log('🔗 HTTPS URL: https://localhost:8443');
// });

server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Dashboard & Mobile Apps Server`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.CLOUDFLARE_ENABLED === 'true') {
    console.log(`Cloudflare Integration: ✅ ENABLED`);
    console.log(`Cloudflare Domain: ${process.env.CLOUDFLARE_DOMAIN || 'Not configured'}`);
  } else {
    console.log(`Cloudflare Integration: ⚠️  DISABLED`);
  }
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, io };
