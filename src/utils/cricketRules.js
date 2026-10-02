/**
 * Cricket Rules and Statistical Helper Functions
 * Never use decimal arithmetic for overs; store and count legal balls.
 */

/**
 * Convert total legal balls to standard cricket over notation (e.g. 8 balls -> "1.2")
 * @param {number} legalBalls
 * @returns {string}
 */
const ballsToOvers = (legalBalls = 0) => {
  const safeBalls = Math.max(0, parseInt(legalBalls, 10) || 0);
  const overs = Math.floor(safeBalls / 6);
  const balls = safeBalls % 6;
  return `${overs}.${balls}`;
};

/**
 * Convert standard cricket overs notation ("1.2") to legal balls (8)
 * @param {string|number} oversStr
 * @returns {number}
 */
const oversToBalls = (oversStr) => {
  if (typeof oversStr === 'number') {
    const overs = Math.floor(oversStr);
    const balls = Math.round((oversStr - overs) * 10);
    return overs * 6 + balls;
  }
  const parts = String(oversStr).split('.');
  const overs = parseInt(parts[0], 10) || 0;
  const balls = parseInt(parts[1], 10) || 0;
  return overs * 6 + balls;
};

/**
 * Calculate Current Run Rate (CRR)
 * @param {number} runs
 * @param {number} legalBalls
 * @returns {number}
 */
const calculateRunRate = (runs = 0, legalBalls = 0) => {
  if (!legalBalls || legalBalls <= 0) return 0;
  const oversDecimal = legalBalls / 6;
  return Number((runs / oversDecimal).toFixed(2));
};

/**
 * Calculate Required Run Rate (RRR)
 * @param {number} runsNeeded
 * @param {number} ballsRemaining
 * @returns {number}
 */
const calculateRequiredRunRate = (runsNeeded = 0, ballsRemaining = 0) => {
  if (runsNeeded <= 0) return 0;
  if (!ballsRemaining || ballsRemaining <= 0) {
    return runsNeeded > 0 ? 99.99 : 0;
  }
  const oversDecimal = ballsRemaining / 6;
  return Number((runsNeeded / oversDecimal).toFixed(2));
};

/**
 * Calculate Target for 2nd innings
 * @param {number} firstInningsRuns
 * @returns {number}
 */
const calculateTarget = (firstInningsRuns = 0) => {
  return Math.max(0, firstInningsRuns) + 1;
};

/**
 * Determine match outcome for completed second innings
 */
const determineMatchResult = ({
  innings1Runs = 0,
  innings2Runs = 0,
  innings2Wickets = 0,
  target = 0,
  totalOvers = 20,
  legalBallsInnings2 = 0,
  battingTeam2,
  bowlingTeam2,
}) => {
  const team2Name = battingTeam2?.name || battingTeam2?.shortName || 'Chasing Team';
  const team1Name = bowlingTeam2?.name || bowlingTeam2?.shortName || 'Defending Team';

  // Target reached by chasing team
  if (innings2Runs >= target) {
    const wicketsLeft = Math.max(0, 10 - innings2Wickets);
    return {
      isCompleted: true,
      winner: battingTeam2?._id || battingTeam2?.id || battingTeam2,
      result: `${team2Name} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'}`,
    };
  }

  // Overs completed or all out without reaching target
  const maxBalls = totalOvers * 6;
  const isAllOut = innings2Wickets >= 10;
  const isOversFinished = legalBallsInnings2 >= maxBalls;

  if (isAllOut || isOversFinished) {
    if (innings2Runs === target - 1) {
      return {
        isCompleted: true,
        winner: null,
        result: 'Match tied',
      };
    } else if (innings2Runs < target - 1) {
      const margin = (target - 1) - innings2Runs;
      return {
        isCompleted: true,
        winner: bowlingTeam2?._id || bowlingTeam2?.id || bowlingTeam2,
        result: `${team1Name} won by ${margin} run${margin === 1 ? '' : 's'}`,
      };
    }
  }

  return {
    isCompleted: false,
    winner: null,
    result: null,
  };
};

/**
 * Generate commentary text for a delivery
 */
const generateCommentary = ({
  strikerName = 'Batter',
  bowlerName = 'Bowler',
  runsOffBat = 0,
  extraType = null,
  extraRuns = 0,
  isWicket = false,
  wicketType = null,
  dismissedPlayerName = null,
  fielderName = null,
}) => {
  if (isWicket) {
    const dismissed = dismissedPlayerName || strikerName;
    let desc = `OUT! ${dismissed} is dismissed!`;
    if (wicketType === 'bowled') {
      desc = `OUT! BOWLED! ${bowlerName} rattles the timber! ${dismissed} departs.`;
    } else if (wicketType === 'caught') {
      desc = fielderName
        ? `OUT! CAUGHT! ${dismissed} is caught by ${fielderName} off ${bowlerName}'s bowling.`
        : `OUT! CAUGHT! ${dismissed} departs caught off ${bowlerName}.`;
    } else if (wicketType === 'lbw') {
      desc = `OUT! LBW! Plumb in front! ${bowlerName} traps ${dismissed} leg before wicket.`;
    } else if (wicketType === 'run_out') {
      desc = fielderName
        ? `OUT! RUN OUT! Direct hit / sharp fielding by ${fielderName}! ${dismissed} falls short.`
        : `OUT! RUN OUT! Confusion between the wickets, ${dismissed} is run out!`;
    } else if (wicketType === 'stumped') {
      desc = fielderName
        ? `OUT! STUMPED! Lightning quick glovework from ${fielderName} off ${bowlerName}. ${dismissed} is stumped!`
        : `OUT! STUMPED! ${dismissed} steps out and gets stumped off ${bowlerName}.`;
    } else if (wicketType === 'hit_wicket') {
      desc = `OUT! HIT WICKET! ${dismissed} accidentally disturbs the stumps!`;
    }
    return desc;
  }

  if (extraType === 'wide') {
    return extraRuns > 1
      ? `Wide ball and ${extraRuns - 1} additional run(s) taken.`
      : `Wide ball called by the umpire. 1 extra run added.`;
  }

  if (extraType === 'no_ball') {
    let text = `NO BALL called! Free hit coming up!`;
    if (runsOffBat === 4) text += ` AND FOUR! ${strikerName} smashes it to the boundary!`;
    else if (runsOffBat === 6) text += ` AND SIX! What a massive hit from ${strikerName}!`;
    else if (runsOffBat > 0) text += ` Batter takes ${runsOffBat} run(s).`;
    return text;
  }

  if (extraType === 'bye') {
    return `${extraRuns} bye(s) conceded.`;
  }

  if (extraType === 'leg_bye') {
    return `${extraRuns} leg bye(s) off the pads.`;
  }

  if (extraType === 'penalty') {
    return `${extraRuns} penalty runs awarded.`;
  }

  // Normal runs
  if (runsOffBat === 6) {
    return `SIX! ${strikerName} clears the ropes with a colossal maximum!`;
  }
  if (runsOffBat === 4) {
    return `FOUR! Glorious shot by ${strikerName}, beats the fielders to the rope.`;
  }
  if (runsOffBat === 0) {
    return `No run. Good delivery from ${bowlerName}, defended solidly by ${strikerName}.`;
  }
  if (runsOffBat === 1) {
    return `1 run. ${strikerName} pushes it into the gap and rotates the strike.`;
  }
  return `${runsOffBat} runs taken smoothly by the batters.`;
};

module.exports = {
  ballsToOvers,
  oversToBalls,
  calculateRunRate,
  calculateRequiredRunRate,
  calculateTarget,
  determineMatchResult,
  generateCommentary,
};
