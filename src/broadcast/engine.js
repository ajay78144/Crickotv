const fs = require('fs');
const path = require('path');
const { createDefaultMatchState } = require('./defaultState');
const { PRESET_TEAMS } = require('./presets');

const DATA_DIR = path.join(__dirname, '../../data');
const STATE_FILE = path.join(DATA_DIR, 'match-state.json');
const MAX_UNDO = 50;

class BroadcastEngine {
  constructor() {
    this.state = null;
    this.undoStack = [];
    this.redoStack = [];
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STATE_FILE)) {
      try {
        const raw = fs.readFileSync(STATE_FILE, 'utf8');
        this.state = JSON.parse(raw);
        console.log('✅ Loaded broadcast match state from data/match-state.json');
      } catch (err) {
        console.warn('⚠️ Error reading match-state.json, creating default state:', err.message);
        this.state = createDefaultMatchState();
        this.saveState();
      }
    } else {
      this.state = createDefaultMatchState();
      this.saveState();
      console.log('✅ Initialized new default match state in data/match-state.json');
    }
  }

  saveState() {
    try {
      const jsonContent = JSON.stringify(this.state, null, 2);
      try {
        const tempPath = `${STATE_FILE}.tmp`;
        fs.writeFileSync(tempPath, jsonContent, 'utf8');
        fs.renameSync(tempPath, STATE_FILE);
      } catch (renameErr) {
        // Fallback for Windows file lock / antivirus indexer
        fs.writeFileSync(STATE_FILE, jsonContent, 'utf8');
      }
    } catch (err) {
      console.error('❌ Failed save to data/match-state.json:', err.message);
    }
  }

  pushUndo() {
    if (this.state) {
      this.undoStack.push(JSON.parse(JSON.stringify(this.state)));
      if (this.undoStack.length > MAX_UNDO) {
        this.undoStack.shift();
      }
      this.redoStack = []; // Clear redo on new action
    }
  }

  getState() {
    return this.state;
  }

  startNewMatch({ team1Key, team2Key, totalOvers, tossWinner, tossDecision }) {
    this.pushUndo();

    const t1Key = (team1Key || 'IND').toUpperCase();
    const t2Key = (team2Key || 'AUS').toUpperCase();

    const t1Preset = PRESET_TEAMS[t1Key] || PRESET_TEAMS.IND;
    const t2Preset = PRESET_TEAMS[t2Key] || PRESET_TEAMS.AUS;

    const overs = Math.max(1, parseInt(totalOvers, 10) || 20);
    const winner = tossWinner === 'team2' ? 'team2' : 'team1';
    const decision = tossDecision === 'bowl' ? 'bowl' : 'bat';

    // Rule:
    // If Team 1 wins toss & bats OR Team 2 wins toss & bowls -> Team 1 Bats First.
    // Else -> Team 2 Bats First.
    let battingFirstKey = 'team1';
    let bowlingFirstKey = 'team2';

    if (
      (winner === 'team1' && decision === 'bat') ||
      (winner === 'team2' && decision === 'bowl')
    ) {
      battingFirstKey = 'team1';
      bowlingFirstKey = 'team2';
    } else {
      battingFirstKey = 'team2';
      bowlingFirstKey = 'team1';
    }

    const battingPreset = battingFirstKey === 'team1' ? t1Preset : t2Preset;
    const bowlingPreset = bowlingFirstKey === 'team1' ? t1Preset : t2Preset;

    const opener1 = battingPreset.squad[0] || { id: 'p1', name: 'Opener 1', shortName: 'Opener 1', image: '', jerseyNumber: 1, role: 'batsman' };
    const opener2 = battingPreset.squad[1] || { id: 'p2', name: 'Opener 2', shortName: 'Opener 2', image: '', jerseyNumber: 2, role: 'batsman' };
    const firstBowler = bowlingPreset.squad[bowlingPreset.squad.length - 2] || bowlingPreset.squad[0];

    const tossTeamName = winner === 'team1' ? t1Preset.name : t2Preset.name;
    const tossSummary = `${tossTeamName} won the toss and elected to ${decision} first.`;

    this.state = {
      id: `match_${Date.now()}`,
      title: `${t1Preset.name} vs ${t2Preset.name} - ${overs} Overs`,
      tournament: 'CrickoTV Championship 2026',
      format: overs <= 10 ? 'T10' : overs <= 20 ? 'T20' : 'ODI',
      totalOvers: overs,
      venue: 'Wankhede Stadium, Mumbai',
      toss: tossSummary,
      tossWinner: winner,
      tossDecision: decision,
      status: 'LIVE',
      currentInnings: 1,
      target: null,
      statusText: '1st Innings in progress',
      requiredRunsText: '',
      resultSummary: '',
      winner: '',
      isFreeHit: false,
      isRainDelay: false,
      rainDelayText: '',
      tickerText: `LIVE: ${t1Preset.name} vs ${t2Preset.name} • ${tossSummary}`,

      team1: {
        key: t1Preset.key,
        name: t1Preset.name,
        shortName: t1Preset.shortName,
        country: t1Preset.country,
        logo: t1Preset.logo,
        flag: t1Preset.flag,
        primaryColor: t1Preset.primaryColor,
        secondaryColor: t1Preset.secondaryColor,
        squad: [...t1Preset.squad],
      },

      team2: {
        key: t2Preset.key,
        name: t2Preset.name,
        shortName: t2Preset.shortName,
        country: t2Preset.country,
        logo: t2Preset.logo,
        flag: t2Preset.flag,
        primaryColor: t2Preset.primaryColor,
        secondaryColor: t2Preset.secondaryColor,
        squad: [...t2Preset.squad],
      },

      team1Score: {
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        oversDisplay: '0.0',
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
      },

      team2Score: {
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        oversDisplay: '0.0',
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
      },

      firstInningsSummary: null,

      liveState: {
        battingTeamId: battingFirstKey,
        bowlingTeamId: bowlingFirstKey,
        currentRunRate: 0.0,
        requiredRunRate: 0.0,
        target: null,
        runsNeeded: null,
        ballsRemaining: overs * 6,
        lastWicket: 'None',
        currentPartnership: { runs: 0, balls: 0 },
        recentBalls: [],
        currentBatsmen: [
          {
            id: opener1.id,
            name: opener1.name,
            shortName: opener1.shortName,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0.0,
            isStriker: true,
            image: opener1.image,
            jerseyNumber: opener1.jerseyNumber,
            role: opener1.role,
          },
          {
            id: opener2.id,
            name: opener2.name,
            shortName: opener2.shortName,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0.0,
            isStriker: false,
            image: opener2.image,
            jerseyNumber: opener2.jerseyNumber,
            role: opener2.role,
          },
        ],
        currentBowler: {
          id: firstBowler.id,
          name: firstBowler.name,
          shortName: firstBowler.shortName,
          overs: 0,
          balls: 0,
          oversDisplay: '0.0',
          maidens: 0,
          runs: 0,
          wickets: 0,
          economy: 0.0,
          image: firstBowler.image,
          jerseyNumber: firstBowler.jerseyNumber,
        },
      },

      winProbability: { team1: 50, team2: 50 },
      fallOfWickets: { team1: [], team2: [] },
      overHistory: { team1: [], team2: [] },
      commentary: [
        {
          id: `c_${Date.now()}`,
          ball: '0.0',
          text: `Match started! ${tossSummary} ${opener1.name} and ${opener2.name} open the innings. ${firstBowler.name} with the ball.`,
          type: 'info',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    this.saveState();
    return this.state;
  }

  recordBall({
    runs = 0,
    isExtra = false,
    extraType = null, // 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'penalty' | null
    batRuns = 0,
    runsCompleted = 0,
    isWicket = false,
    dismissal = 'bowled', // 'bowled'|'caught'|'lbw'|'run_out'|'stumped'|'hit_wicket'
    nextPlayerId = null,
  }) {
    if (this.state.status === 'COMPLETED') {
      throw new Error('Match is already completed');
    }

    this.pushUndo();

    const battingKey = this.state.liveState.battingTeamId; // 'team1' or 'team2'
    const teamScore = battingKey === 'team1' ? this.state.team1Score : this.state.team2Score;
    const battingTeamObj = battingKey === 'team1' ? this.state.team1 : this.state.team2;
    const live = this.state.liveState;

    const striker = live.currentBatsmen.find((b) => b.isStriker);
    const nonStriker = live.currentBatsmen.find((b) => !b.isStriker);
    const bowler = live.currentBowler;

    const wasFreeHit = Boolean(this.state.isFreeHit);
    let nextFreeHit = false;
    let isLegalDelivery = true;
    let totalDeliveryRuns = 0;
    let ballSymbol = '0';
    let celebration = null;

    // Parse values
    const safeBatRuns = parseInt(batRuns, 10) || 0;
    const safeRuns = parseInt(runs, 10) || 0;
    const safeExtraRuns = parseInt(runsCompleted, 10) || 0;

    // 1. Extra logic
    if (isExtra) {
      if (extraType === 'wide') {
        isLegalDelivery = false;
        const wideRuns = safeRuns > 0 ? safeRuns : 1;
        totalDeliveryRuns = wideRuns;
        teamScore.extras.wides += wideRuns;
        teamScore.extras.total += wideRuns;
        teamScore.runs += wideRuns;
        bowler.runs += wideRuns;
        ballSymbol = wideRuns > 1 ? `${wideRuns}WD` : 'WD';

        // Wide on free hit: free hit remains!
        if (wasFreeHit) nextFreeHit = true;

        // Odd wide runs rotate strike
        if (wideRuns % 2 === 1) {
          striker.isStriker = false;
          nonStriker.isStriker = true;
        }
      } else if (extraType === 'no_ball') {
        isLegalDelivery = false;
        nextFreeHit = true; // FREE HIT triggered
        const nbExtra = 1;
        const totalNbRuns = nbExtra + safeBatRuns;
        totalDeliveryRuns = totalNbRuns;

        teamScore.extras.noBalls += nbExtra;
        teamScore.extras.total += nbExtra;
        teamScore.runs += totalNbRuns;
        bowler.runs += totalNbRuns;

        // Batsman gets the bat runs
        striker.runs += safeBatRuns;
        striker.balls += 1; // Faces the delivery
        if (safeBatRuns === 4) striker.fours += 1;
        if (safeBatRuns === 6) striker.sixes += 1;

        ballSymbol = safeBatRuns > 0 ? `NB+${safeBatRuns}` : 'NB';

        // If batsman scored 4 or 6, trigger celebration
        if (safeBatRuns === 6) celebration = 'six';
        else if (safeBatRuns === 4) celebration = 'four';

        // Odd runs swap strike
        if (safeBatRuns % 2 === 1) {
          striker.isStriker = false;
          nonStriker.isStriker = true;
        }
      } else if (extraType === 'bye' || extraType === 'leg_bye') {
        isLegalDelivery = true;
        const byeRuns = safeRuns > 0 ? safeRuns : 1;
        totalDeliveryRuns = byeRuns;

        if (extraType === 'bye') {
          teamScore.extras.byes += byeRuns;
        } else {
          teamScore.extras.legByes += byeRuns;
        }
        teamScore.extras.total += byeRuns;
        teamScore.runs += byeRuns;

        // Batsman faced a legal ball but gets 0 runs
        striker.balls += 1;
        // Bowler is NOT charged with bye/leg-bye runs
        ballSymbol = `${byeRuns}${extraType === 'bye' ? 'B' : 'LB'}`;

        // Odd runs swap strike
        if (byeRuns % 2 === 1) {
          striker.isStriker = false;
          nonStriker.isStriker = true;
        }
      } else if (extraType === 'penalty') {
        isLegalDelivery = false;
        const penaltyRuns = safeRuns > 0 ? safeRuns : 5;
        totalDeliveryRuns = penaltyRuns;
        teamScore.extras.penalty += penaltyRuns;
        teamScore.extras.total += penaltyRuns;
        teamScore.runs += penaltyRuns;
        ballSymbol = `${penaltyRuns}PEN`;
      }
    } else {
      // Normal bat delivery
      isLegalDelivery = true;
      totalDeliveryRuns = safeRuns;
      teamScore.runs += safeRuns;
      bowler.runs += safeRuns;

      striker.runs += safeRuns;
      striker.balls += 1;
      if (safeRuns === 4) {
        striker.fours += 1;
        celebration = 'four';
      } else if (safeRuns === 6) {
        striker.sixes += 1;
        celebration = 'six';
      }

      ballSymbol = String(safeRuns);

      // Check batsman milestones
      if (striker.runs >= 100 && striker.runs - safeRuns < 100) celebration = 'century';
      else if (striker.runs >= 50 && striker.runs - safeRuns < 50) celebration = 'fifty';

      // Odd runs swap strike
      if (safeRuns % 2 === 1) {
        striker.isStriker = false;
        nonStriker.isStriker = true;
      }
    }

    // 2. Wicket logic
    let wicketFallen = false;
    if (isWicket) {
      // Free hit protection: only run_out is allowed on free hit
      if (wasFreeHit && dismissal !== 'run_out') {
        // Can't be out on free hit!
      } else {
        wicketFallen = true;
        teamScore.wickets += 1;
        if (dismissal !== 'run_out') {
          bowler.wickets += 1;
        }
        ballSymbol = ballSymbol === '0' ? 'W' : `${ballSymbol}+W`;
        celebration = 'wicket';

        // Record fall of wicket
        const currentScoreStr = `${teamScore.runs}/${teamScore.wickets}`;
        const fowRecord = {
          wicketNumber: teamScore.wickets,
          score: currentScoreStr,
          player: striker.name,
          overs: teamScore.oversDisplay,
        };
        if (battingKey === 'team1') {
          this.state.fallOfWickets.team1.push(fowRecord);
        } else {
          this.state.fallOfWickets.team2.push(fowRecord);
        }
        live.lastWicket = `${striker.name} (${striker.runs}) - ${currentScoreStr}`;

        // Reset partnership
        live.currentPartnership = { runs: 0, balls: 0 };

        // Replace batsman with next player from squad if provided
        const dismissedPlayerId = striker.id;
        const availablePlayer = nextPlayerId
          ? battingTeamObj.squad.find((p) => p.id === nextPlayerId)
          : battingTeamObj.squad.find(
              (p) =>
                p.id !== dismissedPlayerId &&
                p.id !== nonStriker.id &&
                !this.isPlayerDismissed(battingKey, p.id)
            );

        if (availablePlayer) {
          striker.id = availablePlayer.id;
          striker.name = availablePlayer.name;
          striker.shortName = availablePlayer.shortName;
          striker.runs = 0;
          striker.balls = 0;
          striker.fours = 0;
          striker.sixes = 0;
          striker.strikeRate = 0.0;
          striker.isStriker = true;
          striker.image = availablePlayer.image;
          striker.jerseyNumber = availablePlayer.jerseyNumber;
          striker.role = availablePlayer.role;
        }
      }
    } else {
      live.currentPartnership.runs += totalDeliveryRuns;
    }

    // 3. Legal delivery count & over progression
    let overCompleted = false;
    if (isLegalDelivery) {
      teamScore.balls += 1;
      bowler.balls += 1;
      live.currentPartnership.balls += 1;

      if (bowler.balls % 6 === 0) {
        bowler.overs += 1;
        bowler.balls = 0;
      }
      bowler.oversDisplay = `${bowler.overs}.${bowler.balls}`;

      if (teamScore.balls % 6 === 0) {
        teamScore.overs += 1;
        teamScore.balls = 0;
        overCompleted = true;
      }
      teamScore.oversDisplay = `${teamScore.overs}.${teamScore.balls}`;
    }

    // Recalculate strike rates & bowler economy
    live.currentBatsmen.forEach((b) => {
      b.strikeRate = b.balls > 0 ? Number(((b.runs / b.balls) * 100).toFixed(1)) : 0.0;
    });

    const bowlerTotalLegalBalls = bowler.overs * 6 + bowler.balls;
    bowler.economy =
      bowlerTotalLegalBalls > 0
        ? Number(((bowler.runs / (bowlerTotalLegalBalls / 6))).toFixed(1))
        : 0.0;

    // Free hit state update
    this.state.isFreeHit = nextFreeHit;

    // Recent balls tracking (max 12)
    live.recentBalls.push(ballSymbol);
    if (live.recentBalls.length > 12) {
      live.recentBalls.shift();
    }

    // Over completion: auto rotate strike
    if (overCompleted) {
      const b1 = live.currentBatsmen[0];
      const b2 = live.currentBatsmen[1];
      const temp = b1.isStriker;
      b1.isStriker = b2.isStriker;
      b2.isStriker = temp;

      // Over history record
      const overRecord = {
        overNumber: teamScore.overs,
        bowler: bowler.name,
        runsConceded: bowler.runs,
        totalScore: `${teamScore.runs}/${teamScore.wickets}`,
      };
      if (battingKey === 'team1') {
        this.state.overHistory.team1.push(overRecord);
      } else {
        this.state.overHistory.team2.push(overRecord);
      }
    }

    // Recalculate run rates & balls remaining
    const totalTeamLegalBalls = teamScore.overs * 6 + teamScore.balls;
    live.currentRunRate =
      totalTeamLegalBalls > 0
        ? Number(((teamScore.runs / (totalTeamLegalBalls / 6))).toFixed(2))
        : 0.0;

    const maxOversBalls = this.state.totalOvers * 6;
    live.ballsRemaining = Math.max(0, maxOversBalls - totalTeamLegalBalls);

    // 4. Check Innings 1 Completion (Paari Samapt)
    let inningsBreakTriggered = false;
    let matchCompletedTriggered = false;

    if (this.state.currentInnings === 1) {
      const isAllOut = teamScore.wickets >= 10;
      const isOversFinished = teamScore.overs >= this.state.totalOvers && teamScore.balls === 0;

      if (isAllOut || isOversFinished) {
        this.state.status = 'INNINGS BREAK';
        this.state.target = teamScore.runs + 1;
        this.state.statusText = `Innings Break: Target ${this.state.target} runs`;
        this.state.firstInningsSummary = {
          teamName: battingTeamObj.name,
          runs: teamScore.runs,
          wickets: teamScore.wickets,
          overs: teamScore.oversDisplay,
          target: this.state.target,
        };
        celebration = 'innings_break';
        inningsBreakTriggered = true;
      }
    } else if (this.state.currentInnings === 2) {
      // 5. 2nd Innings Win / Loss / Tie Outcome
      const target = this.state.target || 1;
      live.runsNeeded = Math.max(0, target - teamScore.runs);
      live.requiredRunRate =
        live.ballsRemaining > 0
          ? Number(((live.runsNeeded / (live.ballsRemaining / 6))).toFixed(2))
          : live.runsNeeded > 0
          ? 99.9
          : 0.0;

      this.state.requiredRunsText = `Need ${live.runsNeeded} runs from ${live.ballsRemaining} balls`;

      const chasingWon = teamScore.runs >= target;
      const isAllOut = teamScore.wickets >= 10;
      const isOversFinished = teamScore.overs >= this.state.totalOvers && teamScore.balls === 0;

      if (chasingWon) {
        this.state.status = 'COMPLETED';
        this.state.winner = battingTeamObj.name;
        const wicketsLeft = Math.max(0, 10 - teamScore.wickets);
        this.state.resultSummary = `${battingTeamObj.name} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'} (${live.ballsRemaining} balls remaining)!`;
        this.state.statusText = this.state.resultSummary;
        celebration = 'win';
        matchCompletedTriggered = true;
      } else if (isAllOut || isOversFinished) {
        this.state.status = 'COMPLETED';
        const defendingTeam = battingKey === 'team1' ? this.state.team2 : this.state.team1;

        if (teamScore.runs === target - 1) {
          this.state.winner = 'TIE';
          this.state.resultSummary = `MATCH TIED! Scores level (${teamScore.runs}/${teamScore.wickets}). Super Over required!`;
          this.state.statusText = this.state.resultSummary;
          celebration = 'win';
          matchCompletedTriggered = true;
        } else if (teamScore.runs < target - 1) {
          const runMargin = target - 1 - teamScore.runs;
          this.state.winner = defendingTeam.name;
          this.state.resultSummary = `${defendingTeam.name} won by ${runMargin} run${runMargin === 1 ? '' : 's'}!`;
          this.state.statusText = this.state.resultSummary;
          celebration = 'win';
          matchCompletedTriggered = true;
        }
      }
    }

    // 6. Win Probability calculation
    this.calculateWinProbability();

    // 7. Add commentary
    this.addCommentary({
      ball: teamScore.oversDisplay,
      text: `${bowler.name} to ${striker.name}: ${ballSymbol}${isWicket ? ` - OUT (${dismissal})!` : ''} [${teamScore.runs}/${teamScore.wickets}]`,
      type: isWicket ? 'wicket' : safeRuns >= 4 ? 'boundary' : 'delivery',
    });

    this.saveState();

    return {
      state: this.state,
      overCompleted,
      inningsBreak: inningsBreakTriggered,
      matchCompleted: matchCompletedTriggered,
      celebration,
    };
  }

  isPlayerDismissed(teamKey, playerId) {
    const fows = teamKey === 'team1' ? this.state.fallOfWickets.team1 : this.state.fallOfWickets.team2;
    return fows.some((f) => f.player && f.player.includes(playerId));
  }

  calculateWinProbability() {
    if (this.state.status === 'COMPLETED') {
      if (this.state.winner === this.state.team1.name) {
        this.state.winProbability = { team1: 100, team2: 0 };
      } else if (this.state.winner === this.state.team2.name) {
        this.state.winProbability = { team1: 0, team2: 100 };
      } else {
        this.state.winProbability = { team1: 50, team2: 50 };
      }
      return;
    }

    if (this.state.currentInnings === 1) {
      const crr = this.state.liveState.currentRunRate;
      const wickets = this.state.liveState.battingTeamId === 'team1' ? this.state.team1Score.wickets : this.state.team2Score.wickets;
      let prob = 50 + (crr - 8.0) * 4 - wickets * 3;
      prob = Math.max(10, Math.min(90, Math.round(prob)));
      if (this.state.liveState.battingTeamId === 'team1') {
        this.state.winProbability = { team1: prob, team2: 100 - prob };
      } else {
        this.state.winProbability = { team1: 100 - prob, team2: prob };
      }
    } else {
      const rrr = this.state.liveState.requiredRunRate;
      const crr = this.state.liveState.currentRunRate;
      const wickets = this.state.liveState.battingTeamId === 'team1' ? this.state.team1Score.wickets : this.state.team2Score.wickets;
      let chasingProb = 50 + (crr - rrr) * 8 - (wickets - 3) * 5;
      chasingProb = Math.max(5, Math.min(95, Math.round(chasingProb)));

      if (this.state.liveState.battingTeamId === 'team1') {
        this.state.winProbability = { team1: chasingProb, team2: 100 - chasingProb };
      } else {
        this.state.winProbability = { team1: 100 - chasingProb, team2: chasingProb };
      }
    }
  }

  swapStrike() {
    this.pushUndo();
    const b1 = this.state.liveState.currentBatsmen[0];
    const b2 = this.state.liveState.currentBatsmen[1];
    const temp = b1.isStriker;
    b1.isStriker = b2.isStriker;
    b2.isStriker = temp;
    this.saveState();
    return this.state;
  }

  selectBowler(bowlerInput) {
    this.pushUndo();
    const live = this.state.liveState;
    live.currentBowler = {
      id: bowlerInput.id || bowlerInput.playerId || `bowler_${Date.now()}`,
      name: bowlerInput.name || 'Bowler',
      shortName: bowlerInput.shortName || bowlerInput.name || 'Bowler',
      overs: bowlerInput.overs || 0,
      balls: bowlerInput.balls || 0,
      oversDisplay: bowlerInput.oversDisplay || '0.0',
      maidens: bowlerInput.maidens || 0,
      runs: bowlerInput.runs || 0,
      wickets: bowlerInput.wickets || 0,
      economy: bowlerInput.economy || 0.0,
      image: bowlerInput.image || '',
      jerseyNumber: bowlerInput.jerseyNumber || null,
    };
    this.saveState();
    return this.state;
  }

  startSecondInnings({ chasingTeamKey, strikerId, nonStrikerId, bowlerId, target }) {
    this.pushUndo();
    this.state.currentInnings = 2;
    this.state.status = 'LIVE';

    const chasingKey = chasingTeamKey || (this.state.liveState.battingTeamId === 'team1' ? 'team2' : 'team1');
    const defendingKey = chasingKey === 'team1' ? 'team2' : 'team1';

    const chasingTeam = chasingKey === 'team1' ? this.state.team1 : this.state.team2;
    const defendingTeam = defendingKey === 'team1' ? this.state.team1 : this.state.team2;

    const op1 = strikerId
      ? chasingTeam.squad.find((p) => p.id === strikerId)
      : chasingTeam.squad[0];
    const op2 = nonStrikerId
      ? chasingTeam.squad.find((p) => p.id === nonStrikerId)
      : chasingTeam.squad[1];
    const b1 = bowlerId
      ? defendingTeam.squad.find((p) => p.id === bowlerId)
      : defendingTeam.squad[defendingTeam.squad.length - 2] || defendingTeam.squad[0];

    const finalTarget = target ? parseInt(target, 10) : this.state.target || 100;
    this.state.target = finalTarget;
    this.state.statusText = `2nd Innings: Target ${finalTarget} runs`;

    this.state.liveState = {
      battingTeamId: chasingKey,
      bowlingTeamId: defendingKey,
      currentRunRate: 0.0,
      requiredRunRate: Number(((finalTarget / this.state.totalOvers)).toFixed(2)),
      target: finalTarget,
      runsNeeded: finalTarget,
      ballsRemaining: this.state.totalOvers * 6,
      lastWicket: 'None',
      currentPartnership: { runs: 0, balls: 0 },
      recentBalls: [],
      currentBatsmen: [
        {
          id: op1.id,
          name: op1.name,
          shortName: op1.shortName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0.0,
          isStriker: true,
          image: op1.image,
          jerseyNumber: op1.jerseyNumber,
          role: op1.role,
        },
        {
          id: op2.id,
          name: op2.name,
          shortName: op2.shortName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0.0,
          isStriker: false,
          image: op2.image,
          jerseyNumber: op2.jerseyNumber,
          role: op2.role,
        },
      ],
      currentBowler: {
        id: b1.id,
        name: b1.name,
        shortName: b1.shortName,
        overs: 0,
        balls: 0,
        oversDisplay: '0.0',
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: 0.0,
        image: b1.image,
        jerseyNumber: b1.jerseyNumber,
      },
    };

    this.addCommentary({
      ball: '0.0',
      text: `2nd Innings underway! ${chasingTeam.name} need ${finalTarget} runs from ${this.state.totalOvers} overs.`,
      type: 'info',
    });

    this.saveState();
    return this.state;
  }

  revertFirstInnings() {
    this.pushUndo();
    this.state.currentInnings = 1;
    this.state.status = 'LIVE';
    this.saveState();
    return this.state;
  }

  manualEditScore({ runs, wickets, overs, target }) {
    this.pushUndo();
    const battingKey = this.state.liveState.battingTeamId;
    const teamScore = battingKey === 'team1' ? this.state.team1Score : this.state.team2Score;

    if (runs !== undefined) teamScore.runs = parseInt(runs, 10);
    if (wickets !== undefined) teamScore.wickets = parseInt(wickets, 10);
    if (overs !== undefined) {
      const parts = String(overs).split('.');
      teamScore.overs = parseInt(parts[0], 10) || 0;
      teamScore.balls = parseInt(parts[1], 10) || 0;
      teamScore.oversDisplay = `${teamScore.overs}.${teamScore.balls}`;
    }
    if (target !== undefined) {
      this.state.target = parseInt(target, 10);
      this.state.liveState.target = this.state.target;
    }

    this.saveState();
    return this.state;
  }

  editPlayerStats({ target, data }) {
    this.pushUndo();
    const live = this.state.liveState;
    if (target === 'striker') {
      const s = live.currentBatsmen.find((b) => b.isStriker);
      if (s && data) Object.assign(s, data);
    } else if (target === 'nonStriker') {
      const ns = live.currentBatsmen.find((b) => !b.isStriker);
      if (ns && data) Object.assign(ns, data);
    } else if (target === 'bowler') {
      if (live.currentBowler && data) Object.assign(live.currentBowler, data);
    }
    this.saveState();
    return this.state;
  }

  saveSquad({ teamKey, squad }) {
    this.pushUndo();
    if (teamKey === 'team1') {
      this.state.team1.squad = squad;
    } else if (teamKey === 'team2') {
      this.state.team2.squad = squad;
    }
    this.saveState();
    return this.state;
  }

  updateTeamIdentity({ teamKey, name, shortName, logo, primaryColor }) {
    this.pushUndo();
    const team = teamKey === 'team1' ? this.state.team1 : this.state.team2;
    if (team) {
      if (name) team.name = name;
      if (shortName) team.shortName = shortName;
      if (logo) team.logo = logo;
      if (primaryColor) team.primaryColor = primaryColor;
    }
    this.saveState();
    return this.state;
  }

  setupEnvironment({ isRainDelay, rainDelayText, totalOvers, revisedTarget }) {
    this.pushUndo();
    if (isRainDelay !== undefined) this.state.isRainDelay = Boolean(isRainDelay);
    if (rainDelayText !== undefined) this.state.rainDelayText = rainDelayText;
    if (totalOvers !== undefined) this.state.totalOvers = parseInt(totalOvers, 10);
    if (revisedTarget !== undefined) {
      this.state.target = parseInt(revisedTarget, 10);
      this.state.liveState.target = this.state.target;
    }
    this.saveState();
    return this.state;
  }

  updateTicker(text) {
    this.state.tickerText = text;
    this.saveState();
    return this.state;
  }

  addCommentary({ ball, text, type = 'info' }) {
    const entry = {
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ball: ball || this.state.team1Score.oversDisplay,
      text,
      type,
      timestamp: new Date().toISOString(),
    };
    this.state.commentary.unshift(entry);
    if (this.state.commentary.length > 100) {
      this.state.commentary.pop();
    }
    return entry;
  }

  undo() {
    if (this.undoStack.length > 0) {
      this.redoStack.push(JSON.parse(JSON.stringify(this.state)));
      this.state = this.undoStack.pop();
      this.saveState();
      return this.state;
    }
    return this.state;
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push(JSON.parse(JSON.stringify(this.state)));
      this.state = this.redoStack.pop();
      this.saveState();
      return this.state;
    }
    return this.state;
  }

  reset() {
    this.pushUndo();
    this.state = createDefaultMatchState();
    this.saveState();
    return this.state;
  }
}

const broadcastEngineInstance = new BroadcastEngine();

module.exports = broadcastEngineInstance;
