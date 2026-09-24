# TradeStream — High-Frequency Limit Order Book & Matching Engine Simulator

A production-ready **Stock Market Intelligence, Trading Platform & Order Matching Engine Simulator** built with React, Vite, Node.js, Express, PostgreSQL, Prisma ORM, Socket.IO, and a Neo-Brutalist UI.

---

## 🎯 Problem Statement

> **Real stock exchanges process millions of orders per second using complex price-time priority algorithms — yet no accessible, open simulator lets students, engineers, or researchers observe, interact with, and learn from this mechanics in real time.**

TradeStream solves this by building an end-to-end, fully operational matching engine and market intelligence platform — giving you a transparent, instrumented window into how modern financial markets work, from order ingestion to trade execution, live news sentiment to company intelligence.

---

## ⚡ Features & Problem Alignment — At a Glance

| Feature | What It Does | Problem It Solves |
|---|---|---|
| **Price-Time Priority Matching Engine** | Executes BUY/SELL Limit & Market orders in microseconds using strict FIFO queue ordering | Simulates real exchange matching logic — invisible in production systems |
| **Live Order Book & Depth Visualizer** | Shows real-time top-10 bid/ask levels with depth bars, mid-price & spread | Makes the order book — the heartbeat of every exchange — visually transparent |
| **Partial Fill Execution** | Fills orders against available liquidity; residual quantity stays in the book | Mirrors real exchange behavior where large orders rarely fill completely in one shot |
| **Microsecond Latency Tracker** | Measures matching execution time via `performance.now()` — displayed live on-screen | Reveals the performance cost of different order types and book depths |
| **5 Autonomous AI Trader Bots** | Bull, Bear, Aggressive, Value, and MarketMaker bots inject continuous orders | Simulates real market participants creating organic price discovery without manual input |
| **Engine Simulator Dashboard** | Tracks Orders Processed, Trades Executed, Throughput (orders/sec), Avg Latency, Best Bid/Ask | Provides a real-time KPI panel identical to what an exchange monitoring team would watch |
| **Per-Company Trading Console** | Dedicated order form for any ticker (NVDA, TSLA, MSFT, RELIANCE) with ₹/$ toggle | Bridges simulated exchange mechanics with recognizable real-world assets |
| **Market Intelligence Dashboard** | IPO Directory with Finnhub live quotes, Tavily AI company summaries, growth charts | Addresses the gap between raw price data and actionable market context |
| **Market Pulse — Live News Feed** | Real-time news stream filtered by company, sentiment (Bullish/Neutral/Bearish) & topic | Connects news sentiment to price movement — the qualitative side of trading decisions |
| **Dual-Currency Support (₹ / $)** | Seamlessly toggles between INR and USD with accurate market-cap and pricing context | Makes the platform relevant to both Indian startup investors and global markets |
| **Trending Topics & Sentiment Index** | Aggregates keyword momentum and a 0–100 market greed/fear index from live data | Replicates the sentiment analytics layer used by institutional quant desks |
| **Company Growth Heatmap** | Color-coded heatmap showing 24H % change across all tracked companies | Gives a portfolio-wide view of capital rotation at a glance |
| **Live Ticker Tape** | Persistent sticky bar showing live price + change for all tracked symbols | Replicates the real-time feed seen on Bloomberg, CNBC, and NSE terminals |
| **Backend REST API + Socket.IO** | `/api/orders`, `/api/ipos`, `/api/company/:symbol`, `/api/news`, `/api/market-pulse` | Enables programmatic access — the same way algorithmic traders consume exchange data feeds |
| **Prisma ORM + PostgreSQL Persistence** | Stores all orders, trades, and market context in a relational database | Gives the simulation real persistence — orders survive page refreshes like on a real exchange |
| **Node-Cron Scheduler (7s ticks)** | Automatically drives market tick cycles, bot activity, and price updates | Replicates real exchange session clocks and market event scheduling |

---


## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React + Vite)"]
        UI["User Interface (Neo-Brutalist Theme)"]
        ME["In-Memory Matching Engine (MatchingEngine.js)"]
        TP["Trading Console (TradingPage.jsx)"]
        ES["Engine Simulator (EngineSimulatorPage.jsx)"]
        DB["Dashboard & IPO Directory (Dashboard.jsx)"]
    end

    subgraph AI_Agents ["Autonomous Simulation Fleet"]
        BA["Bull Agent 🐂"]
        BEA["Bear Agent 🐻"]
        MM["Market Maker Agent ⚖️"]
        AUT["Continuous Simulation Loop ⚡"]
    end

    subgraph Backend ["Backend API & Real-Time Server (Express + Socket.IO)"]
        API["REST API Router (/api/orders, /api/context)"]
        SCHED["Node-Cron Scheduler (7s Ticks)"]
        SOC["Socket.IO Event Server"]
        FIN["Finnhub Quotes Adapter"]
        TAV["Tavily AI Intelligence Adapter"]
    end

    subgraph Database ["Persistence Layer"]
        PRISMA["Prisma ORM (v6.4.1)"]
        PG[(PostgreSQL Database)]
    end

    %% Client Interactions
    UI --> TP
    UI --> ES
    UI --> DB

    %% Matching Engine Flow
    ES <--> ME
    AI_Agents -->|Order Injection| ME
    ME -->|Order Book / Fills / Latency| ES

    %% Backend Flow
    TP <-->|HTTP POST / GET| API
    DB <-->|Live Quotes & AI Intel| API
    API --> FIN
    API --> TAV
    API --> SOC
    SCHED -->|Trigger Market Ticks| SOC

    %% Database Flow
    API --> PRISMA
    PRISMA --> PG
```

---

## 🌟 Key Features & Highlights

### 1. ⚙️ In-Memory Price-Time Priority Matching Engine (`MatchingEngine.js`)
- **Price-Time Priority (FIFO) Algorithm**:
  - `BIDs` sorted highest price first (descending).
  - `ASKs` sorted lowest price first (ascending).
  - Orders at the same price level are executed in strict First-In-First-Out (FIFO) queue order.
- **Order Types**: Full support for `LIMIT` and `MARKET` orders across `BUY` and `SELL` sides.
- **Partial Fills**: Fills partial liquidity and places remaining limit quantity into the order book queue.
- **Microsecond Latency Tracking**: Real-time performance tracking measuring matching execution latency in milliseconds/microseconds (`performance.now()`).

---

### 2. 📊 Matching Engine Simulator Dashboard (`EngineSimulatorPage.jsx`)
- **Engine Metrics KPI Dashboard**: Live tracking of *Orders Processed*, *Trades Executed*, *Orders / Sec (Throughput)*, *Average Latency (ms)*, *Best Bid/Ask & Spread*, and *Open Depth*.
- **Live Order Book & Depth Visualizer**:
  - Top 10 Bids (Green depth bars) & Asks (Red depth bars).
  - Live Mid Price & Spread banner (`Ask - Bid`).
  - Click-to-Price auto-filling into Order Entry.
- **Order Flow Visual Pipeline**: 3-stage animated order flow: `1. Order Entry Queue ➜ 2. Matching Engine ➜ 3. Trade Execution / Book`.
- **Open Orders Management**: Filterable active limit orders table with one-click **Cancel** order capabilities.
- **Live Executed Trade Feed**: Chronological trade execution ledger with taker side indicators and trade IDs.
- **🤖 AI Trader Simulation Agents**:
  - 🐂 **Bull Agent**: Generates aggressive BUY orders pushing prices up.
  - 🐻 **Bear Agent**: Generates aggressive SELL orders pushing prices down.
  - ⚖️ **Market Maker Agent**: Places paired BID/ASK limit orders providing continuous liquidity.
  - ⚡ **Continuous Simulation**: Automatic background order loop running by default on page load.

---

### 3. ⚡ Dedicated Per-Company Trading Console (`TradingPage.jsx`)
- **Universal Ticker Support**: Dedicated trading interfaces for any public company (e.g., `MSFT`, `TSLA`, `AAPL`, `NVDA`, `RELIANCE`).
- **Multi-Currency Toggle**: Instant switcher between **₹ (INR)** and **$ (USD)** with dynamic total estimation.
- **Order Time History Log**: Chronological order execution log tracking user and autonomous trader orders (`ValueTrader`, `MarketMakerTrader`, `MomentumTrader`, `BearTrader`, `AggressiveTrader`).

---

### 4. 📈 Market Intelligence & IPO Directory (`Dashboard.jsx`)
- **Public IPO Catalog**: Browse, filter, and search active public listings and IPOs.
- **Finnhub & Tavily AI Integration**: Live market quotes powered by Finnhub and AI company intelligence summaries powered by Tavily Search.
- **Visual Analytics**: Interactive step trajectory charts and weekly volume activity bars.

---

## 📁 Repository Structure

```
TradeValue/
├── Frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── engine/           # In-Memory Price-Time Priority Matching Engine
│   │   │   └── MatchingEngine.js
│   │   ├── pages/            # Page Views
│   │   │   ├── Dashboard.jsx / Dashboard.css         # Main Intelligence Directory
│   │   │   ├── EngineSimulatorPage.jsx / .css        # Matching Engine Simulator
│   │   │   ├── TradingPage.jsx / TradingPage.css     # Dedicated Per-Company Console
│   │   │   ├── Home.jsx / Welcome.jsx                # Landing & Onboarding
│   │   ├── components/       # UI Components & Market Pulse
│   │   ├── services/         # orderService & Finnhub/Tavily API adapters
│   │   ├── App.jsx           # Top-level Routing
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── backend/                  # Node.js Express & Socket.IO Engine
│   ├── src/
│   │   ├── controllers/      # market, news, order, trader controllers
│   │   ├── routes/           # REST API routes
│   │   ├── scheduler/        # node-cron simulation scheduler
│   │   ├── services/         # market context & finnhub/tavily adapters
│   │   ├── traders/          # 5 autonomous trader strategy classes
│   │   └── server.js
│   ├── prisma/               # schema.prisma & seed.js
│   └── package.json
│
├── package.json              # Root orchestration scripts
└── README.md
```

---

## 🚀 Quick Start & Deployment Guide

### 1. Installation
Clone the repository and install dependencies:
```bash
# Install root dependencies
npm install

# Install Frontend dependencies
cd Frontend && npm install

# Install Backend dependencies
cd ../backend && npm install
```

### 2. Environment Configuration (`backend/.env`)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trader_simulation?schema=public"
FINNHUB_API=d95v1l9r01qj66kq12igd95v1l9r01qj66kq12j0
TAVILY_API=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
```

### 3. Database & Prisma Setup
```bash
cd backend
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push --schema=prisma/schema.prisma
```

### 4. Run Local Development Server
Start the Vite dev server from the root directory:
```bash
npm run dev
```
Frontend : https://trade-stream-alpha.vercel.app/
Backend  : https://tradestream-w1ys.onrender.com
### 5. 🌐 1-Click Vercel Deployment (Full-Stack Frontend + Serverless API)
This project is configured to run 100% on **Vercel** with zero external servers needed:
1. **Import the repository** into Vercel.
2. Vercel automatically detects `vercel.json` and runs `npm run build`.
3. The React/Vite UI is served from `Frontend/dist`, and all `/api/*` endpoints are handled natively via Vercel Serverless Functions (`api/index.js`).
4. **No external URLs or Render setup required!**

---

## 📜 License
ISC License. Built for High-Performance Trading Systems & Market Engine Simulations.
