const { PRESET_TEAMS } = require('./presets');

const createDefaultMatchState = () => {
  const team1Preset = PRESET_TEAMS.IND;
  const team2Preset = PRESET_TEAMS.AUS;

  const opener1 = team1Preset.squad[0];
  const opener2 = team1Preset.squad[1];
  const bowler1 = team2Preset.squad[9]; // Bumrah / Starc equivalent

  return {
    id: 'crickotv_match_live',
    title: 'ICC Men\'s T20 World Cup 2026 - Final',
    tournament: 'ICC T20 World Cup 2026',
    format: 'T20',
    totalOvers: 20,
    venue: 'Narendra Modi Stadium, Ahmedabad',
    toss: 'India won the toss and elected to bat first.',
    tossWinner: 'team1',
    tossDecision: 'bat',
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
    tickerText: 'LIVE CRICKOTV BROADCAST: ICC T20 World Cup Final 2026 • IND vs AUS • Real-time Official Scoring',

    team1: {
      key: team1Preset.key,
      name: team1Preset.name,
      shortName: team1Preset.shortName,
      country: team1Preset.country,
      logo: team1Preset.logo,
      flag: team1Preset.flag,
      primaryColor: team1Preset.primaryColor,
      secondaryColor: team1Preset.secondaryColor,
      squad: [...team1Preset.squad],
    },

    team2: {
      key: team2Preset.key,
      name: team2Preset.name,
      shortName: team2Preset.shortName,
      country: team2Preset.country,
      logo: team2Preset.logo,
      flag: team2Preset.flag,
      primaryColor: team2Preset.primaryColor,
      secondaryColor: team2Preset.secondaryColor,
      squad: [...team2Preset.squad],
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
      battingTeamId: 'team1',
      bowlingTeamId: 'team2',
      currentRunRate: 0.0,
      requiredRunRate: 0.0,
      target: null,
      runsNeeded: null,
      ballsRemaining: 120,
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
        id: bowler1.id,
        name: bowler1.name,
        shortName: bowler1.shortName,
        overs: 0,
        balls: 0,
        oversDisplay: '0.0',
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: 0.0,
        image: bowler1.image,
        jerseyNumber: bowler1.jerseyNumber,
      },
    },

    winProbability: { team1: 50, team2: 50 },
    fallOfWickets: { team1: [], team2: [] },
    overHistory: { team1: [], team2: [] },
    commentary: [
      {
        id: 'c_0',
        ball: '0.0',
        text: 'Welcome to CrickoTV live coverage. Both teams are out in the middle. Play is about to start!',
        type: 'info',
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

module.exports = {
  createDefaultMatchState,
};
