require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Player = require('../src/models/Player');
const Tournament = require('../src/models/Tournament');
const Match = require('../src/models/Match');
const OverlaySetting = require('../src/models/OverlaySetting');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crickotv';
    console.log(`Connecting to MongoDB for seeding: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
    await mongoose.connect(mongoUri);

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Player.deleteMany({}),
      Tournament.deleteMany({}),
      Match.deleteMany({}),
      OverlaySetting.deleteMany({}),
    ]);

    console.log('👤 Seeding Admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123', // Will be hashed by pre('save')
      role: 'super_admin',
      isActive: true,
    });

    console.log('🏏 Seeding Teams...');
    const india = await Team.create({
      name: 'India',
      shortName: 'IND',
      country: 'India',
      logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=120&h=120&q=80',
      primaryColor: '#0054A6',
      secondaryColor: '#FF671F',
    });

    const australia = await Team.create({
      name: 'Australia',
      shortName: 'AUS',
      country: 'Australia',
      logo: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=120&h=120&q=80',
      primaryColor: '#006432',
      secondaryColor: '#FFCC00',
    });

    console.log('👥 Seeding Players for India (15 players)...');
    const indiaPlayersData = [
      { name: 'Rohit Sharma', role: 'batsman', jerseyNumber: 45, isCaptain: true, battingStyle: 'right_hand' },
      { name: 'Yashasvi Jaiswal', role: 'batsman', jerseyNumber: 64, battingStyle: 'left_hand' },
      { name: 'Virat Kohli', role: 'batsman', jerseyNumber: 18, battingStyle: 'right_hand' },
      { name: 'Suryakumar Yadav', role: 'batsman', jerseyNumber: 63, battingStyle: 'right_hand' },
      { name: 'Rishabh Pant', role: 'wicket_keeper', jerseyNumber: 17, isWicketKeeper: true, battingStyle: 'left_hand' },
      { name: 'Hardik Pandya', role: 'all_rounder', jerseyNumber: 33, battingStyle: 'right_hand', bowlingStyle: 'right_arm_medium' },
      { name: 'Ravindra Jadeja', role: 'all_rounder', jerseyNumber: 8, battingStyle: 'left_hand', bowlingStyle: 'left_arm_spin' },
      { name: 'Axar Patel', role: 'all_rounder', jerseyNumber: 20, battingStyle: 'left_hand', bowlingStyle: 'left_arm_spin' },
      { name: 'Kuldeep Yadav', role: 'bowler', jerseyNumber: 23, battingStyle: 'left_hand', bowlingStyle: 'left_arm_spin' },
      { name: 'Jasprit Bumrah', role: 'bowler', jerseyNumber: 93, battingStyle: 'right_hand', bowlingStyle: 'right_arm_fast' },
      { name: 'Arshdeep Singh', role: 'bowler', jerseyNumber: 2, battingStyle: 'left_hand', bowlingStyle: 'left_arm_fast' },
      // Bench
      { name: 'Sanju Samson', role: 'wicket_keeper', jerseyNumber: 9, isWicketKeeper: true },
      { name: 'Mohammed Siraj', role: 'bowler', jerseyNumber: 73, bowlingStyle: 'right_arm_fast' },
      { name: 'Shivam Dube', role: 'all_rounder', jerseyNumber: 25 },
      { name: 'Yuzvendra Chahal', role: 'bowler', jerseyNumber: 3 },
    ];

    const indiaPlayers = await Player.insertMany(
      indiaPlayersData.map((p) => ({ ...p, teamId: india._id }))
    );

    console.log('👥 Seeding Players for Australia (15 players)...');
    const ausPlayersData = [
      { name: 'Travis Head', role: 'batsman', jerseyNumber: 62, battingStyle: 'left_hand' },
      { name: 'David Warner', role: 'batsman', jerseyNumber: 31, battingStyle: 'left_hand' },
      { name: 'Mitchell Marsh', role: 'all_rounder', jerseyNumber: 8, isCaptain: true, battingStyle: 'right_hand', bowlingStyle: 'right_arm_medium' },
      { name: 'Glenn Maxwell', role: 'all_rounder', jerseyNumber: 32, battingStyle: 'right_hand', bowlingStyle: 'right_arm_spin' },
      { name: 'Marcus Stoinis', role: 'all_rounder', jerseyNumber: 17, battingStyle: 'right_hand', bowlingStyle: 'right_arm_medium' },
      { name: 'Tim David', role: 'batsman', jerseyNumber: 85, battingStyle: 'right_hand' },
      { name: 'Matthew Wade', role: 'wicket_keeper', jerseyNumber: 13, isWicketKeeper: true, battingStyle: 'left_hand' },
      { name: 'Pat Cummins', role: 'bowler', jerseyNumber: 30, battingStyle: 'right_hand', bowlingStyle: 'right_arm_fast' },
      { name: 'Mitchell Starc', role: 'bowler', jerseyNumber: 56, battingStyle: 'left_hand', bowlingStyle: 'left_arm_fast' },
      { name: 'Adam Zampa', role: 'bowler', jerseyNumber: 88, battingStyle: 'right_hand', bowlingStyle: 'right_arm_spin' },
      { name: 'Josh Hazlewood', role: 'bowler', jerseyNumber: 38, battingStyle: 'right_hand', bowlingStyle: 'right_arm_fast' },
      // Bench
      { name: 'Josh Inglis', role: 'wicket_keeper', jerseyNumber: 48, isWicketKeeper: true },
      { name: 'Cameron Green', role: 'all_rounder', jerseyNumber: 42 },
      { name: 'Nathan Ellis', role: 'bowler', jerseyNumber: 12 },
      { name: 'Ashton Agar', role: 'all_rounder', jerseyNumber: 46 },
    ];

    const ausPlayers = await Player.insertMany(
      ausPlayersData.map((p) => ({ ...p, teamId: australia._id }))
    );

    console.log('🏆 Seeding Tournament...');
    const tournament = await Tournament.create({
      name: "ICC Men's T20 World Cup 2026",
      shortName: 'T20WC',
      country: 'India & Sri Lanka',
      season: '2026',
      format: 'T20',
      status: 'ongoing',
    });

    console.log('⚔️ Seeding Sample Match...');
    const sampleMatch = await Match.create({
      tournamentId: tournament._id,
      teamA: india._id,
      teamB: australia._id,
      matchNumber: 'Final Match',
      matchType: 'T20',
      totalOvers: 20,
      date: new Date(),
      time: '19:30 IST',
      venue: 'Narendra Modi Stadium, Ahmedabad',
      status: 'scheduled',
      playingXI: {
        teamA: indiaPlayers.slice(0, 11).map((p) => p._id),
        teamB: ausPlayers.slice(0, 11).map((p) => p._id),
      },
      createdBy: admin._id,
    });

    await OverlaySetting.create({
      matchId: sampleMatch._id,
      theme: 'modern_dark',
      primaryColor: '#0054A6',
      secondaryColor: '#FF671F',
      tickerText: "LIVE: ICC T20 World Cup Final 2026 - India vs Australia",
    });

    console.log('\n===========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('===========================================');
    console.log('🔐 Default Admin Credentials:');
    console.log('   Email:    admin@example.com');
    console.log('   Password: password123');
    console.log('   Role:     super_admin');
    console.log('-------------------------------------------');
    console.log(`🇮🇳 India Team ID:     ${india._id}`);
    console.log(`🇦🇺 Australia Team ID: ${australia._id}`);
    console.log(`🏆 Tournament ID:     ${tournament._id}`);
    console.log(`⚔️ Sample Match ID:   ${sampleMatch._id}`);
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

seedData();
