// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const { io } = require('socket.io-client');
const pdf_router = require('./router/post/pdf_manager');
const ConversionError = require('./utils/conversion_error');
const initializeDatabase = require('./mongo_connection');
const dotenv = require('dotenv');
dotenv.config()
const CONFIG = require('./utils/config');
const pdf_router_get = require('./router/get/pdf_getter');
const pdf_router_post = require('./router/post/pdf_post_manager');

const bodyParser = require('express').json;






// Initialize WebSocket client
const socket = io(CONFIG.wsServer, {
  auth: {
    connection: "pdf_service",
    withCredentials: true,
  }
});



// Socket connection handling
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from WebSocket server:', reason);
});



// Initialize Express app
const app = express();
app.use(cors());
app.use(rateLimit(CONFIG.rateLimit));
app.use(bodyParser());  // for parsing application/json
app.use(express.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded


app.use((req, res, next) => {
  if (!socket.connected) {
    return res.status(503).json({ error: 'WebSocket service unavailable' });
  }
  req.io = { socket };

  next();
});

// Initialize directories
async function initializeDirs() {
  try {
    await Promise.all([
      fs.mkdir(CONFIG.uploadDir, { recursive: true }),
      fs.mkdir(CONFIG.outputDir, { recursive: true })
    ]);
    console.log('Directories initialized successfully');
  } catch (error) {
    console.error('Error initializing directories:', error);
    throw error;
  }
}




// Routes
app.use( pdf_router)
app.use('/get', pdf_router_get)
app.use(pdf_router_post)


app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    version: require('./package.json').version,
    wsStatus: socket.connected ? 'connected' : 'disconnected',
    config: {
      maxFileSize: CONFIG.maxFileSize,
      rateLimit: CONFIG.rateLimit,
      workers: CONFIG.maxWorkers,
      batchSize: CONFIG.batchSize
    }
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Application error:', error);
  const statusCode = error instanceof ConversionError ? error.statusCode : 500;
  res.status(statusCode).json({
    error: error.message,
    status: statusCode
  });
});

// Start server
async function startServer() {
  try {
    await initializeDirs();
    app.listen(CONFIG.port, () => {
      console.log(`PDF conversion service listening at http://localhost:${CONFIG.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

initializeDatabase(startServer)

