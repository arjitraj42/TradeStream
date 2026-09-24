# ⚡ Trader Simulation Engine & Trading Platform

A production-ready, autonomous **Stock Market Simulation & Trading Platform** built with **Node.js, Express, PostgreSQL, Prisma ORM, Socket.IO, React, Vite, and Tailwind CSS**.

This platform continuously simulates realistic stock market participants that dynamically evaluate market context, news events, price movements, and trader risk profiles to generate **BUY** and **SELL** orders every **7 seconds**. These orders are stored in PostgreSQL via Prisma ORM, broadcasted in real-time via **Socket.IO**, and prepared for external forwarding to a separate **Order Matching Engine**.

---

## 🌟 Key Features & Highlights

- **Clean Architecture & Separated Codebase**:
  - `backend/`: Node.js, Express, Socket.IO, Prisma ORM, node-cron.
  - `frontend/`: React, Vite, Tailwind CSS, Axios, Lucide Icons.
- **5 Autonomous Trader Strategies**:
  1. 📈 **MomentumTrader**: Capitalizes on trend momentum (> 2% price moves).
  2. 💎 **ValueTrader**: Executes mean-reversion trades based on fundamental `fairValue`.
  3. 🐻 **BearTrader**: Reacts fearfully to negative news, selling aggressively while buying conservatively on positive news.
  4. ⚡ **AggressiveTrader**: Sweeps market liquidity with large MARKET orders on high-impact news ($\ge 7/10$).
  5. ⚖️ **MarketMakerTrader**: Provides continuous bid/ask limit liquidity around market price.
- **7-Second Paced Simulation Loop**: Runs every 7 seconds (`*/7 * * * * *`) for realistic human-readable order streams.
- **Real-Time Web Dashboard**: Built-in glassmorphic UI displaying live market metrics, dynamic price action, active news impact, trader fleet status, manual Buy/Sell console, and real-time Socket.IO order drawer.
- **Order Time History Log**: Detailed chronological log tracking formatted timestamps (`hh:mm:ss AM/PM`) for all trades.
- **Bonus Engine Capabilities**:
  - **Volatility-based Position Sizing**: Traders scale order sizes according to dynamic volatility and risk appetite.
  - **Exponential News Impact Decay**: News sentiment impact naturally decays over time based on half-life calculations.
  - **Stochastic Price Movement & Mean Reversion**: Realistic random walk with fair value pull.
- **Future Integration Ready**: Non-blocking adapter layer for forwarding generated orders to external Matching Engines via `POST /api/matching-engine/orders`.
- **Fault-Tolerant & Resilient**: Automatic fallback to in-memory caching if PostgreSQL connection is offline or starting up.

---

## 📁 Project Structure

```
TradeValue/
├── backend/                  # Node.js Express & Socket.IO Engine
│   ├── src/
│   │   ├── config/           # env, constants, prisma setup
│   │   ├── controllers/      # market, news, order, trader, simulation
│   │   ├── models/           # zod validation schemas
│   │   ├── repositories/     # news, order, trader config repos
│   │   ├── routes/           # express API routes
│   │   ├── scheduler/        # 7-second node-cron tick manager
│   │   ├── services/         # market context, news, order execution
│   │   ├── sockets/          # Socket.IO event manager
│   │   ├── traders/          # 5 autonomous trader implementations
│   │   └── utils/            # math, logger, error handler
│   ├── prisma/               # schema.prisma & seed.js
│   ├── public/               # fallback static assets
│   ├── .env
│   └── package.json
│
├── frontend/                 # React + Vite + Tailwind CSS Console
│   ├── src/
│   │   ├── components/       # TradingForm, SimulationDrawer, OrderHistoryTable
│   │   ├── pages/            # TradingPage
│   │   ├── services/         # orderService (Axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── package.json              # Root orchestration scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Installation
Clone the repository and install dependencies:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Configuration (`backend/.env`)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trader_simulation?schema=public"
MATCHING_ENGINE_URL="http://localhost:4000/api/matching-engine/orders"
SIMULATION_CRON_SCHEDULE="*/7 * * * * *"
INITIAL_PRICE=100.00
INITIAL_FAIR_VALUE=100.00
INITIAL_VOLATILITY=0.03
AUTO_SIMULATE_PRICE_MOVEMENT=true
```

### 3. Database Setup (PostgreSQL + Prisma)
Generate Prisma Client and push schema to PostgreSQL:
```bash
npm run prisma:generate
npm run prisma:push
npm run seed
```

### 4. Running the Application

From the root directory:

#### Run Backend Server:
```bash
npm run dev:backend
```

#### Run Frontend Dev Server (Vite HMR):
```bash
npm run dev:frontend
```

#### Build Production Bundle:
```bash
npm run build:frontend
```

Once running, access:
- **Interactive Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 📡 REST API Reference

### 1. Market Context API
`GET /api/context` – Returns current market context (price, fair value, volatility, decayed news).

### 2. News/Event Engine API
`POST /api/news` – Broadcasts a new market event (`headline`, `sentiment`, `impactScore`).
`GET /api/news` – Fetches recent news events.

### 3. Orders API
`POST /api/orders` – Submit manual Buy/Sell orders (`side`, `orderType`, `price`, `quantity`).
`GET /api/orders` – Retrieves generated orders history with filtering and pagination.

### 4. Traders Configuration API
`GET /api/traders` – Lists registered autonomous traders and their configurations.
`PUT /api/traders/:traderType` – Update trader settings.

### 5. Simulation Scheduler API
`POST /api/simulation/run` – Execute 1 tick manually.
`POST /api/simulation/start` / `stop` – Pause or resume 7s scheduled loop.

---

## ⚡ Real-Time Socket.IO Events

| Event Name | Description |
| :--- | :--- |
| `new-order` | Emitted whenever an order (user or bot) is generated. |
| `market-update` | Emitted every 7s tick with updated price, fair value & volatility. |
| `news-event` | Emitted immediately when news is published. |
| `simulation-status` | Emitted when simulation is paused or resumed. |

---

## 📜 License
ISC License. Built for Stock Intelligence & Market Simulation Platforms.
