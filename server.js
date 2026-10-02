require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const initSocketIO = require('./src/sockets');

const PORT = process.env.PORT || 5000;

// Create unified HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with open CORS for Admin Desk (:3000) & Overlay (:4200)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach socket listeners and register with socketService
initSocketIO(io);

// Connect to MongoDB and start server
const startServer = async () => {
  // Connect to MongoDB if URI is supplied (Atlas or local)
  if (process.env.MONGODB_URI || process.env.MONGO_URI) {
    await connectDB();
  }

  server.listen(PORT, () => {
    console.log(`🚀 CrickoTV Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 Socket.IO initialized with open broadcast CORS`);
    console.log(`🩺 Health check accessible at: http://localhost:${PORT}/health`);
    console.log(`📺 Broadcast match state: http://localhost:${PORT}/api/match`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`, err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`, err);
  process.exit(1);
});

startServer();

module.exports = { app, server, io };
