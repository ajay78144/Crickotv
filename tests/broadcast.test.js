const engine = require('../src/broadcast/engine');

describe('📡 CrickoTV Broadcast Scoring Engine & Cricket Rules', () => {
  beforeEach(() => {
    // Start clean fresh match between IND and AUS, 20 overs, IND bat first
    engine.startNewMatch({
      team1Key: 'IND',
      team2Key: 'AUS',
      totalOvers: 20,
      tossWinner: 'team1',
      tossDecision: 'bat',
    });
  });

  test('Toss Rules: Team 1 wins toss & bats -> Team 1 bats first', () => {
    const state = engine.getState();
    expect(state.liveState.battingTeamId).toBe('team1');
    expect(state.liveState.bowlingTeamId).toBe('team2');
    expect(state.status).toBe('LIVE');
    expect(state.currentInnings).toBe(1);
    expect(state.totalOvers).toBe(20);
    expect(state.liveState.ballsRemaining).toBe(120);
  });

  test('Normal Delivery & Strike Rotation on Odd Runs', () => {
    // 1st ball: 1 run
    const r1 = engine.recordBall({ runs: 1, isExtra: false });
    expect(r1.state.team1Score.runs).toBe(1);
    expect(r1.state.team1Score.oversDisplay).toBe('0.1');

    // Striker and non-striker should have swapped
    const strikerAfter1 = r1.state.liveState.currentBatsmen.find((b) => b.isStriker);
    const nonStrikerAfter1 = r1.state.liveState.currentBatsmen.find((b) => !b.isStriker);
    expect(strikerAfter1.name).toBe('Yashasvi Jaiswal'); // 2nd opener on strike
    expect(nonStrikerAfter1.name).toBe('Rohit Sharma');
    expect(nonStrikerAfter1.runs).toBe(1);

    // 2nd ball: 4 runs (even run: striker remains)
    const r2 = engine.recordBall({ runs: 4, isExtra: false });
    expect(r2.state.team1Score.runs).toBe(5);
    expect(r2.state.team1Score.oversDisplay).toBe('0.2');
    expect(r2.celebration).toBe('four');
    const strikerAfter2 = r2.state.liveState.currentBatsmen.find((b) => b.isStriker);
    expect(strikerAfter2.name).toBe('Yashasvi Jaiswal');
    expect(strikerAfter2.runs).toBe(4);
  });

  test('Extras: Wide ball does not count legal delivery, increments bowler and extras', () => {
    const r = engine.recordBall({
      runs: 1,
      isExtra: true,
      extraType: 'wide',
    });

    expect(r.state.team1Score.runs).toBe(1);
    expect(r.state.team1Score.extras.wides).toBe(1);
    expect(r.state.team1Score.oversDisplay).toBe('0.0'); // Legal delivery unchanged
    expect(r.state.liveState.currentBowler.runs).toBe(1);
    expect(r.state.liveState.recentBalls).toContain('WD');
  });

  test('No Ball activates Free Hit for next delivery', () => {
    const r1 = engine.recordBall({
      runs: 1,
      isExtra: true,
      extraType: 'no_ball',
      batRuns: 0,
    });

    expect(r1.state.team1Score.runs).toBe(1);
    expect(r1.state.team1Score.extras.noBalls).toBe(1);
    expect(r1.state.isFreeHit).toBe(true);
    expect(r1.state.team1Score.oversDisplay).toBe('0.0');
  });

  test('Compound Delivery: NB + 6 adds 7 runs, 6 to batsman, 1 to NB extra, activates free hit', () => {
    const r = engine.recordBall({
      runs: 7,
      isExtra: true,
      extraType: 'no_ball',
      batRuns: 6,
    });

    expect(r.state.team1Score.runs).toBe(7);
    expect(r.state.team1Score.extras.noBalls).toBe(1);
    expect(r.state.isFreeHit).toBe(true);
    expect(r.celebration).toBe('six');

    const striker = r.state.liveState.currentBatsmen.find((b) => b.isStriker);
    expect(striker.runs).toBe(6);
    expect(striker.sixes).toBe(1);
  });

  test('Compound Delivery: Byes & Leg Byes do not charge runs against bowler', () => {
    const r = engine.recordBall({
      runs: 4,
      isExtra: true,
      extraType: 'leg_bye',
    });

    expect(r.state.team1Score.runs).toBe(4);
    expect(r.state.team1Score.extras.legByes).toBe(4);
    expect(r.state.team1Score.oversDisplay).toBe('0.1'); // Legal ball counts
    expect(r.state.liveState.currentBowler.runs).toBe(0); // Bowler not charged
  });

  test('Over Completion: 6 legal deliveries increments over and auto rotates strike', () => {
    // Bowl 6 dots
    for (let i = 0; i < 5; i++) {
      engine.recordBall({ runs: 0, isExtra: false });
    }
    const r6 = engine.recordBall({ runs: 0, isExtra: false });

    expect(r6.overCompleted).toBe(true);
    expect(r6.state.team1Score.oversDisplay).toBe('1.0');
    // Strike rotated at over end
    const striker = r6.state.liveState.currentBatsmen.find((b) => b.isStriker);
    expect(striker.name).toBe('Yashasvi Jaiswal');
  });

  test('1st Innings Paari Samapt: 10 wickets triggers Innings Break and sets Target', () => {
    // Bowl 10 wickets
    for (let i = 0; i < 9; i++) {
      engine.recordBall({ runs: 0, isWicket: true, dismissal: 'bowled' });
    }
    const lastWicket = engine.recordBall({ runs: 0, isWicket: true, dismissal: 'bowled' });

    expect(lastWicket.inningsBreak).toBe(true);
    expect(lastWicket.state.status).toBe('INNINGS BREAK');
    expect(lastWicket.state.target).toBe(1); // 0 runs + 1
    expect(lastWicket.state.firstInningsSummary).toBeDefined();
    expect(lastWicket.state.firstInningsSummary.target).toBe(1);
  });

  test('2nd Innings: Chasing team reaches target -> COMPLETED with win message', () => {
    // Start second innings with target = 10 runs in 5 overs
    engine.getState().totalOvers = 5;
    engine.startSecondInnings({
      chasingTeamKey: 'team2',
      target: 10,
    });

    expect(engine.getState().currentInnings).toBe(2);
    expect(engine.getState().target).toBe(10);
    expect(engine.getState().liveState.battingTeamId).toBe('team2');

    // Hit a six
    engine.recordBall({ runs: 6, isExtra: false });
    // Hit a four -> reaches 10
    const winResult = engine.recordBall({ runs: 4, isExtra: false });

    expect(winResult.matchCompleted).toBe(true);
    expect(winResult.state.status).toBe('COMPLETED');
    expect(winResult.state.winner).toBe('Australia');
    expect(winResult.state.resultSummary).toContain('Australia won by 10 wickets');
  });

  test('Undo Functionality: reverts previous ball from undo buffer stack', () => {
    engine.recordBall({ runs: 6, isExtra: false });
    expect(engine.getState().team1Score.runs).toBe(6);

    const revertedState = engine.undo();
    expect(revertedState.team1Score.runs).toBe(0);
    expect(revertedState.team1Score.oversDisplay).toBe('0.0');
  });
});
