require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');
const path = require('path');
const db = require('./config/db');
const whatsappService = require('./services/whatsappService');
const reminderService = require('./services/reminderService');

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize WhatsApp Service
whatsappService.initialize(wss);

// Initialize Reminder Service
const whatsappClient = whatsappService.getClient();
reminderService.initialize(whatsappClient);

// API Routes
app.use('/api/loans', require('./controllers/loanController'));

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the web interface at http://localhost:${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});