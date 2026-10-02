const {
  ballsToOvers,
  oversToBalls,
  calculateRunRate,
  calculateRequiredRunRate,
  calculateTarget,
  determineMatchResult,
  generateCommentary,
} = require('../src/utils/cricketRules');
const {
  calculateBatterStats,
  calculateBowlerStats,
} = require('../src/services/scorecard.service');

describe('🏏 Cricket Rules & Scoring Engine Tests', () => {
  describe('Overs & Ball Calculations', () => {
    test('ballsToOvers converts legal balls to cricket notation without floating math error', () => {
      expect(ballsToOvers(0)).toBe('0.0');
      expect(ballsToOvers(1)).toBe('0.1');
      expect(ballsToOvers(5)).toBe('0.5');
      expect(ballsToOvers(6)).toBe('1.0');
      expect(ballsToOvers(8)).toBe('1.2');
      expect(ballsToOvers(120)).toBe('20.0');
      expect(ballsToOvers(119)).toBe('19.5');
    });

    test('oversToBalls converts cricket notation back to legal balls count', () => {
      expect(oversToBalls('0.0')).toBe(0);
      expect(oversToBalls('1.2')).toBe(8);
      expect(oversToBalls('20.0')).toBe(120);
      expect(oversToBalls('19.5')).toBe(119);
    });
  });

  describe('Run Rate & Target Calculations', () => {
    test('calculateRunRate handles zero balls and correct rates', () => {
      expect(calculateRunRate(0, 0)).toBe(0);
      expect(calculateRunRate(10, 6)).toBe(10.0); // 10 runs in 1 over = 10.00
      expect(calculateRunRate(15, 12)).toBe(7.5); // 15 runs in 2 overs = 7.50
      expect(calculateRunRate(45, 30)).toBe(9.0); // 45 runs in 5 overs = 9.00
    });

    test('calculateRequiredRunRate handles runs needed and balls remaining', () => {
      expect(calculateRequiredRunRate(36, 18)).toBe(12.0); // 36 runs in 3 overs (18 balls) = 12.00
      expect(calculateRequiredRunRate(0, 10)).toBe(0);
      expect(calculateRequiredRunRate(10, 0)).toBe(99.99); // impossible rate safeguard
    });

    test('calculateTarget adds 1 run to first innings total', () => {
      expect(calculateTarget(180)).toBe(181);
      expect(calculateTarget(0)).toBe(1);
    });
  });

  describe('Match Result Outcomes', () => {
    const teamA = { id: 'teamA', name: 'India', shortName: 'IND' };
    const teamB = { id: 'teamB', name: 'Australia', shortName: 'AUS' };

    test('Successful Chase: Chasing team reaches target', () => {
      const outcome = determineMatchResult({
        innings1Runs: 180,
        innings2Runs: 181,
        innings2Wickets: 4,
        target: 181,
        totalOvers: 20,
        legalBallsInnings2: 110,
        battingTeam2: teamB,
        bowlingTeam2: teamA,
      });

      expect(outcome.isCompleted).toBe(true);
      expect(outcome.winner).toBe('teamB');
      expect(outcome.result).toBe('Australia won by 6 wickets');
    });

    test('Defending Team Win: Chasing team restricted after 20 overs', () => {
      const outcome = determineMatchResult({
        innings1Runs: 180,
        innings2Runs: 168,
        innings2Wickets: 7,
        target: 181,
        totalOvers: 20,
        legalBallsInnings2: 120, // 20 overs done
        battingTeam2: teamB,
        bowlingTeam2: teamA,
      });

      expect(outcome.isCompleted).toBe(true);
      expect(outcome.winner).toBe('teamA');
      expect(outcome.result).toBe('India won by 12 runs');
    });

    test('Defending Team Win: Chasing team bowled out for 10 wickets', () => {
      const outcome = determineMatchResult({
        innings1Runs: 180,
        innings2Runs: 140,
        innings2Wickets: 10, // All out
        target: 181,
        totalOvers: 20,
        legalBallsInnings2: 95,
        battingTeam2: teamB,
        bowlingTeam2: teamA,
      });

      expect(outcome.isCompleted).toBe(true);
      expect(outcome.winner).toBe('teamA');
      expect(outcome.result).toBe('India won by 40 runs');
    });

    test('Tie Match: Scores equal at end of 2nd innings', () => {
      const outcome = determineMatchResult({
        innings1Runs: 180,
        innings2Runs: 180,
        innings2Wickets: 8,
        target: 181,
        totalOvers: 20,
        legalBallsInnings2: 120,
        battingTeam2: teamB,
        bowlingTeam2: teamA,
      });

      expect(outcome.isCompleted).toBe(true);
      expect(outcome.winner).toBeNull();
      expect(outcome.result).toBe('Match tied');
    });
  });

  describe('Batting Statistics Engine', () => {
    const p1 = 'batter1';

    test('Calculates runs, balls faced, boundaries, and strike rate correctly', () => {
      const deliveries = [
        { strikerId: p1, runsOffBat: 4, extraType: null, isWicket: false },
        { strikerId: p1, runsOffBat: 0, extraType: null, isWicket: false },
        { strikerId: p1, runsOffBat: 6, extraType: null, isWicket: false },
        { strikerId: p1, runsOffBat: 1, extraType: null, isWicket: false },
        // Wide ball: batter does NOT face a ball
        { strikerId: p1, runsOffBat: 0, extraType: 'wide', isWicket: false },
        // Bye: batter faces ball but gets 0 bat runs
        { strikerId: p1, runsOffBat: 0, extraType: 'bye', extraRuns: 1, isWicket: false },
        // No ball: batter faces ball and hits 4
        { strikerId: p1, runsOffBat: 4, extraType: 'no_ball', isWicket: false },
      ];

      const stats = calculateBatterStats(deliveries, p1);
      // Total runs off bat = 4 + 0 + 6 + 1 + 0 + 0 + 4 = 15 runs
      expect(stats.runs).toBe(15);
      // Balls faced: 7 deliveries - 1 wide = 6 balls
      expect(stats.balls).toBe(6);
      expect(stats.fours).toBe(2);
      expect(stats.sixes).toBe(1);
      // Strike rate: 15 / 6 * 100 = 250.00
      expect(stats.strikeRate).toBe(250.0);
      expect(stats.isOut).toBe(false);
      expect(stats.dismissal).toBe('not out');
    });

    test('Correctly records dismissal status', () => {
      const deliveries = [
        { strikerId: p1, runsOffBat: 2, extraType: null, isWicket: false },
        {
          strikerId: p1,
          runsOffBat: 0,
          extraType: null,
          isWicket: true,
          wicketType: 'caught',
          dismissedPlayerId: p1,
        },
      ];

      const stats = calculateBatterStats(deliveries, p1);
      expect(stats.runs).toBe(2);
      expect(stats.balls).toBe(2);
      expect(stats.isOut).toBe(true);
      expect(stats.dismissal).toBe('caught');
    });
  });

  describe('Bowling Statistics Engine', () => {
    const b1 = 'bowler1';

    test('Calculates overs, runs conceded, maidens, wickets, economy accurately', () => {
      const deliveries = [
        // Over 0: Dot, 1, 4, Wide, Dot, Dot, 1 (Legal balls: 6, runs = 1+4+1(wide)+1 = 7)
        { bowlerId: b1, overNumber: 0, runsOffBat: 0, extraType: null, isLegalDelivery: true, isWicket: false },
        { bowlerId: b1, overNumber: 0, runsOffBat: 1, extraType: null, isLegalDelivery: true, isWicket: false },
        { bowlerId: b1, overNumber: 0, runsOffBat: 4, extraType: null, isLegalDelivery: true, isWicket: false },
        { bowlerId: b1, overNumber: 0, runsOffBat: 0, extraType: 'wide', extraRuns: 1, isLegalDelivery: false, isWicket: false },
        { bowlerId: b1, overNumber: 0, runsOffBat: 0, extraType: null, isLegalDelivery: true, isWicket: false },
        { bowlerId: b1, overNumber: 0, runsOffBat: 0, extraType: null, isLegalDelivery: true, isWicket: false },
        { bowlerId: b1, overNumber: 0, runsOffBat: 1, extraType: null, isLegalDelivery: true, isWicket: false },

        // Over 1: Maiden with 1 wicket (6 dots, 1 wicket bowled)
        { bowlerId: b1, overNumber: 1, runsOffBat: 0, extraType: null, isLegalDelivery: true, isWicket: false },
        { bowlerId: b1, overNumber: 1, runsOffBat: 0, extraType: null, isLegalDelivery: true, isWicket: true, wicketType: 'bowled' },
        { bowlerId: b1, overNumber: 1, runsOffBat: 0, extraType: null, isLegalDelivery: true, isWicket: false },
        { bowlerId: b1, overNumber: 1, runsOffBat: 0, extraType: null, isLegalDelivery: true, isWicket: false },
        { bowlerId: b1, overNumber: 1, runsOffBat: 0, extraType: null, isLegalDelivery: true, isWicket: false },
        { bowlerId: b1, overNumber: 1, runsOffBat: 0, extraType: null, isLegalDelivery: true, isWicket: false },
      ];

      const stats = calculateBowlerStats(deliveries, b1);
      expect(stats.legalBalls).toBe(12);
      expect(stats.overs).toBe('2.0');
      expect(stats.runs).toBe(7); // Over 0 gave 7, Over 1 gave 0
      expect(stats.maidens).toBe(1); // Over 1 was a maiden
      expect(stats.wickets).toBe(1);
      expect(stats.wides).toBe(1);
      expect(stats.economy).toBe(3.5); // 7 runs in 2.0 overs = 3.50
    });

    test('Run outs are NOT credited as wickets to the bowler', () => {
      const deliveries = [
        {
          bowlerId: b1,
          overNumber: 0,
          runsOffBat: 1,
          extraType: null,
          isLegalDelivery: true,
          isWicket: true,
          wicketType: 'run_out',
        },
      ];

      const stats = calculateBowlerStats(deliveries, b1);
      expect(stats.wickets).toBe(0); // Bowler not credited
    });

    test('Byes and Leg Byes are NOT charged as runs conceded against bowler', () => {
      const deliveries = [
        {
          bowlerId: b1,
          overNumber: 0,
          runsOffBat: 0,
          extraType: 'bye',
          extraRuns: 4,
          isLegalDelivery: true,
          isWicket: false,
        },
        {
          bowlerId: b1,
          overNumber: 0,
          runsOffBat: 0,
          extraType: 'leg_bye',
          extraRuns: 2,
          isLegalDelivery: true,
          isWicket: false,
        },
      ];

      const stats = calculateBowlerStats(deliveries, b1);
      expect(stats.runs).toBe(0); // Byes/legbyes don't count against bowler
      expect(stats.legalBalls).toBe(2);
    });
  });

  describe('Commentary Generator', () => {
    test('generates commentary for boundaries, wickets, and extras', () => {
      const fourText = generateCommentary({
        strikerName: 'Virat Kohli',
        runsOffBat: 4,
      });
      expect(fourText).toContain('FOUR');
      expect(fourText).toContain('Virat Kohli');

      const sixText = generateCommentary({
        strikerName: 'Rohit Sharma',
        runsOffBat: 6,
      });
      expect(sixText).toContain('SIX');

      const wicketText = generateCommentary({
        strikerName: 'Travis Head',
        bowlerName: 'Jasprit Bumrah',
        isWicket: true,
        wicketType: 'bowled',
      });
      expect(wicketText).toContain('BOWLED');
      expect(wicketText).toContain('Jasprit Bumrah');

      const wideText = generateCommentary({
        extraType: 'wide',
        extraRuns: 1,
      });
      expect(wideText).toContain('Wide ball');
    });
  });
});
