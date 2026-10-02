const engine = require('./engine');

const registerBroadcastSockets = (io) => {
  io.on('connection', (socket) => {
    // Send full match state immediately upon client connection (<50ms synchronization)
    socket.emit('match:update', engine.getState());

    // 1. Start New Match
    socket.on('match:start_new', (data) => {
      try {
        const state = engine.startNewMatch(data || {});
        io.emit('match:update', state);
        io.emit('match:rule_alert', {
          type: 'info',
          title: 'New Match Started',
          message: state.title,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 2. Record Delivery / Ball
    socket.on('ball:record', (data) => {
      try {
        const result = engine.recordBall(data || {});
        io.emit('match:update', result.state);

        if (result.overCompleted) {
          io.emit('over:completed', {
            over: result.state.liveState.battingTeamId === 'team1'
              ? result.state.team1Score.overs
              : result.state.team2Score.overs,
            bowler: result.state.liveState.currentBowler.name,
          });
        }

        if (result.celebration) {
          io.emit('event:celebration', { type: result.celebration });
        }

        if (result.inningsBreak) {
          io.emit('match:rule_alert', {
            type: 'innings_break',
            title: 'Paari Samapt (Innings Break)!',
            message: `Target set: ${result.state.target} runs required to win.`,
          });
        }

        if (result.matchCompleted) {
          io.emit('match:rule_alert', {
            type: 'match_win',
            title: 'Match Finished!',
            message: result.state.resultSummary,
          });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 3. Undo Ball
    socket.on('ball:undo', () => {
      try {
        const state = engine.undo();
        io.emit('match:update', state);
        io.emit('match:rule_alert', {
          type: 'info',
          title: 'Delivery Undone',
          message: 'Previous ball has been reverted from undo buffer stack.',
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 4. Swap Strike
    socket.on('strike:swap', () => {
      try {
        const state = engine.swapStrike();
        io.emit('match:update', state);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 5. Select Bowler
    socket.on('bowler:select', (data) => {
      try {
        const state = engine.selectBowler(data || {});
        io.emit('match:update', state);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 6. Start Second Innings
    socket.on('innings:start_second', (data) => {
      try {
        const state = engine.startSecondInnings(data || {});
        io.emit('match:update', state);
        io.emit('match:rule_alert', {
          type: 'info',
          title: '2nd Innings Started',
          message: `Chase begins! Target: ${state.target} runs.`,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 7. Revert to First Innings
    socket.on('innings:revert_first', () => {
      try {
        const state = engine.revertFirstInnings();
        io.emit('match:update', state);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 8. Manual Score Edit
    socket.on('score:manual_edit', (data) => {
      try {
        const state = engine.manualEditScore(data || {});
        io.emit('match:update', state);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 9. Player Stats Edit
    socket.on('player:stats_edit', (data) => {
      try {
        const state = engine.editPlayerStats(data || {});
        io.emit('match:update', state);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 10. Save Full Squad
    socket.on('squad:save_full', (data) => {
      try {
        const state = engine.saveSquad(data || {});
        io.emit('match:update', state);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 11. Update Team Identity
    socket.on('team:update_identity', (data) => {
      try {
        const state = engine.updateTeamIdentity(data || {});
        io.emit('match:update', state);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 12. Setup Environment (Rain Delay / DLS)
    socket.on('match:setup_environment', (data) => {
      try {
        const state = engine.setupEnvironment(data || {});
        io.emit('match:update', state);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 13. Event Celebration (Broadcast Fanfare)
    socket.on('event:celebration', (data) => {
      io.emit('event:celebration', data);
    });

    // 14. Ticker Update
    socket.on('ticker:update', (text) => {
      const state = engine.updateTicker(text);
      io.emit('match:update', state);
    });

    // 15. Commentary Add
    socket.on('commentary:add', (data) => {
      const entry = engine.addCommentary(data || {});
      io.emit('match:update', engine.getState());
      io.emit('commentary:entry', entry);
    });
  });
};

module.exports = registerBroadcastSockets;
