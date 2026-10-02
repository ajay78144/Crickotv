let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const getSocketIO = () => {
  return ioInstance;
};

const emitToMatch = (matchId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`match:${matchId}`).emit(event, data);
  }
};

const socketService = {
  setSocketIO,
  getSocketIO,
  emitScoreUpdate: (matchId, data) => emitToMatch(matchId, 'score:update', data),
  emitMatchStart: (matchId, data) => emitToMatch(matchId, 'match:start', data),
  emitMatchPause: (matchId, data) => emitToMatch(matchId, 'match:pause', data),
  emitMatchResume: (matchId, data) => emitToMatch(matchId, 'match:resume', data),
  emitInningsEnd: (matchId, data) => emitToMatch(matchId, 'innings:end', data),
  emitMatchEnd: (matchId, data) => emitToMatch(matchId, 'match:end', data),
  emitWicket: (matchId, data) => emitToMatch(matchId, 'wicket', data),
  emitOverlayUpdate: (matchId, data) => emitToMatch(matchId, 'overlay:update', data),
};

module.exports = socketService;
