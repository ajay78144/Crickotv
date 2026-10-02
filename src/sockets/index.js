const socketService = require('../services/socket.service');
const registerBroadcastSockets = require('../broadcast/socketHandler');

const initSocketIO = (io) => {
  socketService.setSocketIO(io);

  // Register broadcast scoring desk & overlay events
  registerBroadcastSockets(io);

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // Join match room
    socket.on('match:join', (matchId) => {
      if (matchId) {
        const roomName = `match:${matchId}`;
        socket.join(roomName);
        console.log(`👥 Socket ${socket.id} joined room ${roomName}`);
        socket.emit('match:joined', { matchId, room: roomName });
      }
    });

    // Leave match room
    socket.on('match:leave', (matchId) => {
      if (matchId) {
        const roomName = `match:${matchId}`;
        socket.leave(roomName);
        console.log(`👋 Socket ${socket.id} left room ${roomName}`);
        socket.emit('match:left', { matchId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected from Socket.IO: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
};

module.exports = initSocketIO;
