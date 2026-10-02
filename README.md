# CrickoTV Live Cricket Score Management & Broadcast Engine 🏏

A production-grade, highly reliable, real-time Cricket Broadcast Backend Server & Scoring Engine built with **Node.js, Express, Socket.IO, Multer, and MongoDB**. Designed as the single source of truth for:
1. **Admin Scorer Desk** (`http://localhost:3000` or operator console)
2. **Live Broadcast Stream Overlay** (`http://localhost:4200` Angular Frontend)

Enforces **Official MCC Cricket Laws**, compound scoring (e.g. `NB + 6`, `4LB`, `1+W`), real-time run rate calculations (CRR, RRR, Win Probability), 11-player rosters with player photos and country/franchise flags, automated strike rotation, 1st innings "Paari Samapt" target setting, and 2nd innings match outcomes.

---

## 🌟 Key Features

- **Dual-Mode Backend Architecture**:
  1. **Real-Time Broadcast Engine**: Atomic JSON-backed persistence (`data/match-state.json`) with an in-memory Undo/Redo stack buffer (depth: 50) and instant `<50ms` WebSocket synchronization (`match:update`) for Angular Broadcast Stream Overlays (`http://localhost:4200`) and Scorer Desks (`http://localhost:3000`).
  2. **Enterprise Cloud Database Mode**: Full MongoDB Atlas persistence with Mongoose models, JWT authentication, and RBAC (`super_admin`, `admin`, `scorer`).
- **Official MCC Cricket Scoring Rules**:
  - **Normal Runs (0, 1, 2, 3, 4, 6)**: Strike rotates on odd runs (1, 3, 5), remains on even runs (0, 2, 4, 6).
  - **Extras (WD, NB, LB, B, PEN)**: Wide ball does not count as legal delivery; No Ball triggers **Free Hit** for subsequent delivery; Byes and Leg-byes are not charged to bowler.
  - **Compound Deliveries**: `NB + 6` (7 runs, free hit next), `NB + 4`, `4LB`, `1 + Run Out`.
  - **Over Completion**: Automatic over transition (e.g. `0.6` -> `1.0`), bowler over statistics update, and automatic strike rotation for the new over.
  - **1st Innings Paari Samapt**: Automatic target calculation (`Target = 1st_innings_runs + 1`) on 10 wickets or total overs completed. Status changes to `'INNINGS BREAK'` with fanfare alert.
  - **2nd Innings Outcomes**:
    - **Chasing Team Wins**: `runs >= target` -> `[Chasing Team] won by [10 - wickets] wickets ([ballsRemaining] balls remaining)!`
    - **Defending Team Wins**: Overs finished or 10 wickets -> `[Defending Team] won by [(target - 1) - chasingScore.runs] runs!`
    - **Match Tied**: Scores level on final ball -> `MATCH TIED! Scores level ([runs]/[wickets]). Super Over required!`
- **Broadcast Fanfare Events**: Instant celebrations triggered over Socket.IO for Boundaries, Sixes, Wickets, 50s, Centuries, Innings Breaks, and Match Wins.
- **Multer File Uploads**: Image uploads for custom player avatars and country/franchise flags served statically at `/uploads/...`.
- **Preset Squads Included**: Built-in 11-player HD rosters for **India (IND)**, **Australia (AUS)**, **Pakistan (PAK)**, **England (ENG)**, **Chennai Super Kings (CSK)**, and **Mumbai Indians (MI)**.

---

## 🏗️ Project Architecture

```text
d:/Crickotv-backend/
├── data/
│   └── match-state.json         # Atomic persistent match state
├── uploads/                     # Uploaded player photos & team flags
├── src/
│   ├── broadcast/               # Real-time Broadcast Scoring Engine
│   │   ├── defaultState.js      # MatchState specification interface
│   │   ├── engine.js            # Scoring engine, undo stack, win probability
│   │   ├── presets.js           # Presets: IND, AUS, PAK, ENG, CSK, MI
│   │   ├── routes.js            # REST endpoints (/api/match, /api/presets, /api/upload)
│   │   └── socketHandler.js     # Real-time Socket.IO event handlers
│   ├── config/
│   │   └── database.js          # MongoDB connection & reconnect handlers
│   ├── controllers/             # Express API controllers
│   ├── middleware/              # Auth JWT, rate limiters, global error handler
│   ├── models/                  # Indexed Mongoose models (User, Team, Player, Match...)
│   ├── routes/                  # Express routes
│   ├── services/                # Cricket rules & scorecard calculations
│   ├── sockets/                 # Socket.IO root registration
│   ├── utils/                   # Cricket helpers & response formatting
│   └── app.js                   # Express application setup
├── scripts/
│   └── seed.js                  # Database seeder (Admin, IND, AUS, Tournament)
├── tests/
│   ├── broadcast.test.js        # Unit tests for Broadcast Scoring Engine
│   └── scoring.test.js          # Unit tests for Cricket Rules & Formulas
├── server.js                    # Unified HTTP + Socket.IO server
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default configuration in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/crickotv
JWT_SECRET=super_secret_crickotv_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```

Server will start on **port 5000**:
- 📡 **Socket.IO:** `ws://localhost:5000`
- 📺 **Live Match State:** `http://localhost:5000/api/match`
- 🩺 **Health Check:** `http://localhost:5000/health`
- 🖼️ **Static Uploads:** `http://localhost:5000/uploads`

### 4. Run Unit Tests (25 Tests Passing)
```bash
npm test
```

---

## 📡 Real-Time Socket.IO Protocol Specification

### Client -> Server Events
| Event | Payload | Description |
|---|---|---|
| `match:start_new` | `{ team1Key, team2Key, totalOvers, tossWinner, tossDecision }` | Starts a fresh match enforcing toss rules |
| `ball:record` | `{ runs, isExtra, extraType, batRuns, runsCompleted, isWicket, dismissal, nextPlayerId }` | Records a delivery with compound rules |
| `ball:undo` | *none* | Reverts last delivery using undo stack |
| `strike:swap` | *none* | Manually toggles striker and non-striker |
| `bowler:select` | `{ playerId, name, shortName, image, jerseyNumber }` | Selects current bowler |
| `innings:start_second`| `{ chasingTeamKey, strikerId, nonStrikerId, bowlerId, target }` | Starts chasing innings |
| `innings:revert_first`| *none* | Reverts back to 1st innings |
| `score:manual_edit` | `{ runs, wickets, overs, target }` | Manual score correction with auto-outcome check |
| `player:stats_edit` | `{ target: 'striker'\|'nonStriker'\|'bowler', data }` | Direct batsman/bowler stats edit |
| `squad:save_full` | `{ teamKey: 'team1'\|'team2', squad: Player[] }` | Overwrites 11-player squad |
| `team:update_identity`| `{ teamKey, name, shortName, logo, primaryColor }` | Customizes team identity |
| `match:setup_environment`| `{ isRainDelay, rainDelayText, totalOvers, revisedTarget }` | Rain delay & DLS adjustments |
| `event:celebration` | `{ type: 'four'\|'six'\|'wicket'\|'fifty'\|'century'\|'win' }` | Fanfare trigger to stream overlay |
| `ticker:update` | `string` | Updates news ticker bar text |
| `commentary:add` | `{ text, type, ball }` | Adds manual commentary line |

### Server -> Client Broadcasts
| Broadcast Event | Payload | Description |
|---|---|---|
| `match:update` | Full `MatchState` | Sent upon connection and after every single state mutation |
| `over:completed` | `{ over: number, bowler: string }` | Emitted when 6 legal deliveries are completed |
| `match:rule_alert` | `{ type: string, title: string, message: string }` | Prompts for over end, all out, innings break, or match win |
| `event:celebration` | `{ type: string }` | Triggers celebration overlay animations |
| `commentary:entry` | `CommentaryEntry` | New commentary entry broadcast |

---

## 🌐 Broadcast REST Endpoints

- **`GET /api/match`**: Returns current active `MatchState`.
- **`POST /api/match/new`**: Starts a fresh match.
- **`POST /api/reset`**: Resets match to clean initial default.
- **`GET /api/presets`**: Returns preset squads (`IND`, `AUS`, `PAK`, `ENG`, `CSK`, `MI`).
- **`POST /api/upload`**: Uploads image (`multipart/form-data`, field: `image`) and returns accessible `/uploads/...` URL.

---

## 🅰️ Angular Broadcast Overlay Integration (`http://localhost:4200`)

```typescript
import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-cricket-overlay',
  templateUrl: './cricket-overlay.component.html',
  styleUrls: ['./cricket-overlay.component.css']
})
export class CricketOverlayComponent implements OnInit {
  private socket: Socket;
  public matchState: any;

  ngOnInit() {
    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    // Instant real-time state synchronization (<50ms)
    this.socket.on('match:update', (state) => {
      this.matchState = state;
    });

    // Celebratory fanfare animations
    this.socket.on('event:celebration', (event) => {
      this.triggerFanfareAnimation(event.type); // 'four', 'six', 'wicket', 'win'
    });

    // Over and innings alerts
    this.socket.on('match:rule_alert', (alert) => {
      console.log('Broadcast Alert:', alert.title, alert.message);
    });
  }

  triggerFanfareAnimation(type: string) {
    // Show overlay graphic (e.g. Fireworks, FOUR banner, Wicket flash)
  }
}
```

---

## ☁️ Render Deployment Guide

1. Push your repository to GitHub / GitLab.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **Web Service**.
3. Select your repository.
4. Set configurations:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**:
   - `PORT`: `5000` (or Render will assign automatically)
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-angular-frontend.vercel.app`
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>` (optional if running broadcast-only mode)
   - `JWT_SECRET`: `<Secure secret>`
6. Deploy! The health check is available at:
   `https://<your-render-service>.onrender.com/health`

---

## 🛡️ License
ISC License © CrickoTV Team
