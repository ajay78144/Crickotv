/**
 * CrickoTV Preset Teams & Squads
 * High-definition logos, flags, player avatars, and full playing XI squads
 */

const PRESET_TEAMS = {
  IND: {
    key: 'IND',
    name: 'India',
    shortName: 'IND',
    country: 'India',
    logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=140&h=140&q=80',
    flag: 'https://flagcdn.com/w160/in.png',
    primaryColor: '#0054A6',
    secondaryColor: '#FF671F',
    squad: [
      { id: 'ind_1', name: 'Rohit Sharma', shortName: 'R Sharma', jerseyNumber: 45, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: true, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_2', name: 'Yashasvi Jaiswal', shortName: 'Y Jaiswal', jerseyNumber: 64, role: 'batsman', battingStyle: 'LHB', bowlingStyle: 'LB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_3', name: 'Virat Kohli', shortName: 'V Kohli', jerseyNumber: 18, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_4', name: 'Suryakumar Yadav', shortName: 'SK Yadav', jerseyNumber: 63, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_5', name: 'Rishabh Pant', shortName: 'R Pant', jerseyNumber: 17, role: 'wicket_keeper', battingStyle: 'LHB', bowlingStyle: 'None', isCaptain: false, isWicketKeeper: true, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_6', name: 'Hardik Pandya', shortName: 'H Pandya', jerseyNumber: 33, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'RFM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_7', name: 'Ravindra Jadeja', shortName: 'R Jadeja', jerseyNumber: 8, role: 'all_rounder', battingStyle: 'LHB', bowlingStyle: 'SLA', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_8', name: 'Axar Patel', shortName: 'A Patel', jerseyNumber: 20, role: 'all_rounder', battingStyle: 'LHB', bowlingStyle: 'SLA', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_9', name: 'Kuldeep Yadav', shortName: 'K Yadav', jerseyNumber: 23, role: 'bowler', battingStyle: 'LHB', bowlingStyle: 'SLC', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_10', name: 'Jasprit Bumrah', shortName: 'J Bumrah', jerseyNumber: 93, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'ind_11', name: 'Arshdeep Singh', shortName: 'A Singh', jerseyNumber: 2, role: 'bowler', battingStyle: 'LHB', bowlingStyle: 'LF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&h=150&q=80' }
    ]
  },
  AUS: {
    key: 'AUS',
    name: 'Australia',
    shortName: 'AUS',
    country: 'Australia',
    logo: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=140&h=140&q=80',
    flag: 'https://flagcdn.com/w160/au.png',
    primaryColor: '#006432',
    secondaryColor: '#FFCC00',
    squad: [
      { id: 'aus_1', name: 'Travis Head', shortName: 'T Head', jerseyNumber: 62, role: 'batsman', battingStyle: 'LHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_2', name: 'David Warner', shortName: 'D Warner', jerseyNumber: 31, role: 'batsman', battingStyle: 'LHB', bowlingStyle: 'LB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_3', name: 'Mitchell Marsh', shortName: 'M Marsh', jerseyNumber: 8, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'RM', isCaptain: true, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_4', name: 'Glenn Maxwell', shortName: 'G Maxwell', jerseyNumber: 32, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_5', name: 'Marcus Stoinis', shortName: 'M Stoinis', jerseyNumber: 17, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_6', name: 'Tim David', shortName: 'T David', jerseyNumber: 85, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_7', name: 'Matthew Wade', shortName: 'M Wade', jerseyNumber: 13, role: 'wicket_keeper', battingStyle: 'LHB', bowlingStyle: 'None', isCaptain: false, isWicketKeeper: true, image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_8', name: 'Pat Cummins', shortName: 'P Cummins', jerseyNumber: 30, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_9', name: 'Mitchell Starc', shortName: 'M Starc', jerseyNumber: 56, role: 'bowler', battingStyle: 'LHB', bowlingStyle: 'LF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_10', name: 'Adam Zampa', shortName: 'A Zampa', jerseyNumber: 88, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'LB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'aus_11', name: 'Josh Hazlewood', shortName: 'J Hazlewood', jerseyNumber: 38, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RFM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&h=150&q=80' }
    ]
  },
  PAK: {
    key: 'PAK',
    name: 'Pakistan',
    shortName: 'PAK',
    country: 'Pakistan',
    logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=140&h=140&q=80',
    flag: 'https://flagcdn.com/w160/pk.png',
    primaryColor: '#006629',
    secondaryColor: '#80B68C',
    squad: [
      { id: 'pak_1', name: 'Babar Azam', shortName: 'B Azam', jerseyNumber: 56, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: true, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_2', name: 'Mohammad Rizwan', shortName: 'M Rizwan', jerseyNumber: 16, role: 'wicket_keeper', battingStyle: 'RHB', bowlingStyle: 'None', isCaptain: false, isWicketKeeper: true, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_3', name: 'Fakhar Zaman', shortName: 'F Zaman', jerseyNumber: 39, role: 'batsman', battingStyle: 'LHB', bowlingStyle: 'SLA', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_4', name: 'Saim Ayub', shortName: 'S Ayub', jerseyNumber: 63, role: 'batsman', battingStyle: 'LHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_5', name: 'Iftikhar Ahmed', shortName: 'I Ahmed', jerseyNumber: 95, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_6', name: 'Shadab Khan', shortName: 'S Khan', jerseyNumber: 7, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'LB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_7', name: 'Imad Wasim', shortName: 'I Wasim', jerseyNumber: 9, role: 'all_rounder', battingStyle: 'LHB', bowlingStyle: 'SLA', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_8', name: 'Shaheen Afridi', shortName: 'S Afridi', jerseyNumber: 10, role: 'bowler', battingStyle: 'LHB', bowlingStyle: 'LF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_9', name: 'Naseem Shah', shortName: 'N Shah', jerseyNumber: 71, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_10', name: 'Haris Rauf', shortName: 'H Rauf', jerseyNumber: 15, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'pak_11', name: 'Mohammad Amir', shortName: 'M Amir', jerseyNumber: 5, role: 'bowler', battingStyle: 'LHB', bowlingStyle: 'LF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&h=150&q=80' }
    ]
  },
  ENG: {
    key: 'ENG',
    name: 'England',
    shortName: 'ENG',
    country: 'England',
    logo: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=140&h=140&q=80',
    flag: 'https://flagcdn.com/w160/gb-eng.png',
    primaryColor: '#15264C',
    secondaryColor: '#CF102D',
    squad: [
      { id: 'eng_1', name: 'Jos Buttler', shortName: 'J Buttler', jerseyNumber: 63, role: 'wicket_keeper', battingStyle: 'RHB', bowlingStyle: 'None', isCaptain: true, isWicketKeeper: true, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_2', name: 'Phil Salt', shortName: 'P Salt', jerseyNumber: 42, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_3', name: 'Will Jacks', shortName: 'W Jacks', jerseyNumber: 29, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_4', name: 'Jonny Bairstow', shortName: 'J Bairstow', jerseyNumber: 51, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'None', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_5', name: 'Harry Brook', shortName: 'H Brook', jerseyNumber: 88, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_6', name: 'Moeen Ali', shortName: 'M Ali', jerseyNumber: 18, role: 'all_rounder', battingStyle: 'LHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_7', name: 'Liam Livingstone', shortName: 'L Livingstone', jerseyNumber: 23, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'LB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_8', name: 'Sam Curran', shortName: 'S Curran', jerseyNumber: 58, role: 'all_rounder', battingStyle: 'LHB', bowlingStyle: 'LFM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_9', name: 'Jofra Archer', shortName: 'J Archer', jerseyNumber: 22, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_10', name: 'Adil Rashid', shortName: 'A Rashid', jerseyNumber: 95, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'LB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'eng_11', name: 'Mark Wood', shortName: 'M Wood', jerseyNumber: 33, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&h=150&q=80' }
    ]
  },
  CSK: {
    key: 'CSK',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    country: 'India (IPL)',
    logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=140&h=140&q=80',
    flag: 'https://flagcdn.com/w160/in.png',
    primaryColor: '#FFFF00',
    secondaryColor: '#0054A6',
    squad: [
      { id: 'csk_1', name: 'Ruturaj Gaikwad', shortName: 'R Gaikwad', jerseyNumber: 31, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: true, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_2', name: 'Rachin Ravindra', shortName: 'R Ravindra', jerseyNumber: 8, role: 'all_rounder', battingStyle: 'LHB', bowlingStyle: 'SLA', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_3', name: 'Daryl Mitchell', shortName: 'D Mitchell', jerseyNumber: 75, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_4', name: 'Shivam Dube', shortName: 'S Dube', jerseyNumber: 25, role: 'all_rounder', battingStyle: 'LHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_5', name: 'Ravindra Jadeja', shortName: 'R Jadeja', jerseyNumber: 8, role: 'all_rounder', battingStyle: 'LHB', bowlingStyle: 'SLA', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_6', name: 'MS Dhoni', shortName: 'MS Dhoni', jerseyNumber: 7, role: 'wicket_keeper', battingStyle: 'RHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: true, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_7', name: 'Sameer Rizvi', shortName: 'S Rizvi', jerseyNumber: 1, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_8', name: 'Shardul Thakur', shortName: 'S Thakur', jerseyNumber: 54, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'RFM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_9', name: 'Tushar Deshpande', shortName: 'T Deshpande', jerseyNumber: 24, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RFM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_10', name: 'Mustafizur Rahman', shortName: 'M Rahman', jerseyNumber: 90, role: 'bowler', battingStyle: 'LHB', bowlingStyle: 'LFM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'csk_11', name: 'Matheesha Pathirana', shortName: 'M Pathirana', jerseyNumber: 99, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&h=150&q=80' }
    ]
  },
  MI: {
    key: 'MI',
    name: 'Mumbai Indians',
    shortName: 'MI',
    country: 'India (IPL)',
    logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=140&h=140&q=80',
    flag: 'https://flagcdn.com/w160/in.png',
    primaryColor: '#004BA0',
    secondaryColor: '#D1AB3E',
    squad: [
      { id: 'mi_1', name: 'Rohit Sharma', shortName: 'R Sharma', jerseyNumber: 45, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_2', name: 'Ishan Kishan', shortName: 'I Kishan', jerseyNumber: 23, role: 'wicket_keeper', battingStyle: 'LHB', bowlingStyle: 'None', isCaptain: false, isWicketKeeper: true, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_3', name: 'Suryakumar Yadav', shortName: 'SK Yadav', jerseyNumber: 63, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'RM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_4', name: 'Tilak Varma', shortName: 'T Varma', jerseyNumber: 9, role: 'batsman', battingStyle: 'LHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_5', name: 'Hardik Pandya', shortName: 'H Pandya', jerseyNumber: 33, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'RFM', isCaptain: true, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_6', name: 'Tim David', shortName: 'T David', jerseyNumber: 85, role: 'batsman', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_7', name: 'Mohammad Nabi', shortName: 'M Nabi', jerseyNumber: 7, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'OB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_8', name: 'Romario Shepherd', shortName: 'R Shepherd', jerseyNumber: 16, role: 'all_rounder', battingStyle: 'RHB', bowlingStyle: 'RFM', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_9', name: 'Piyush Chawla', shortName: 'P Chawla', jerseyNumber: 11, role: 'bowler', battingStyle: 'LHB', bowlingStyle: 'LB', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_10', name: 'Gerald Coetzee', shortName: 'G Coetzee', jerseyNumber: 62, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'mi_11', name: 'Jasprit Bumrah', shortName: 'J Bumrah', jerseyNumber: 93, role: 'bowler', battingStyle: 'RHB', bowlingStyle: 'RF', isCaptain: false, isWicketKeeper: false, image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&h=150&q=80' }
    ]
  }
};

module.exports = {
  PRESET_TEAMS,
};
