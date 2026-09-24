import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import './Home.css';

export default function Home({ onGetStarted }) {
  const [activeHeroTab, setActiveHeroTab] = useState('MEETMUX');
  const [heroTimeframe, setHeroTimeframe] = useState('1M');

  const heroCompanies = [
    { symbol: 'MEETMUX', name: 'MeetMux Tech', price: '₹148.50', change: '+8.40%', isUp: true, stage: 'Series A', market: 'India' },
    { symbol: 'MSFT', name: 'Microsoft Corp', price: '$500.59', change: '+0.52%', isUp: true, stage: 'NASDAQ', market: 'US Tech' },
    { symbol: 'ZEPTO', name: 'Zepto Kirana', price: '₹310.00', change: '+7.80%', isUp: true, stage: 'Unicorn', market: 'India' },
    { symbol: 'NVDA', name: 'Nvidia Corp', price: '$122.40', change: '+3.15%', isUp: true, stage: 'NASDAQ', market: 'US Tech' },
    { symbol: 'ZOMATO', name: 'Zomato Ltd', price: '₹280.40', change: '+3.85%', isUp: true, stage: 'NSE IPO', market: 'India' },
  ];

  const activeComp = heroCompanies.find((c) => c.symbol === activeHeroTab) || heroCompanies[0];

  return (
    <div className="nbh-page">
      <Navbar onGetStarted={onGetStarted} />

      {/* ── 1. HERO SECTION ── */}
      <section className="nbh-hero-section">
        <div className="nbh-container">
          <div className="nbh-hero-content">
            
            {/* Live Status Badge */}
            <div className="nbh-status-pill" onClick={onGetStarted}>
              <span className="nbh-status-dot"></span>
              <span className="nbh-status-txt">SUB-MILLISECOND IN-MEMORY MATCHING · 5 AI TRADER BOTS · LIVE FINNHUB & TAVILY INTEL</span>
              <span className="nbh-status-arrow">↗</span>
            </div>

            <h1 className="nbh-hero-title">
              ONE TERMINAL FOR ALL YOUR <br />
              <span className="nbh-title-highlight yellow">STARTUP & STOCK</span> INTELLIGENCE.
            </h1>

            <p className="nbh-hero-subtitle">
              Simulate high-frequency trading with multi-agent bot liquidity, evaluate early-stage Indian tech ventures in <strong>₹</strong> alongside Wall Street giants in <strong>$</strong>, and synthesize real-time AI risk factors in sub-seconds.
            </p>

            <div className="nbh-hero-cta-row">
              <button className="nbh-btn-lg primary-coral" onClick={onGetStarted}>
                <span>Launch Live Terminal</span>
                <span className="nbh-arrow">↗</span>
              </button>
              <button className="nbh-btn-lg secondary-white" onClick={onGetStarted}>
                <span>Explore Indian Startups (₹)</span>
              </button>
            </div>

            {/* Metrics Strip */}
            <div className="nbh-metrics-box">
              <div className="nbh-metric-col">
                <span className="nbh-metric-num">&lt; 1.8ms</span>
                <span className="nbh-metric-sub">Execution Latency</span>
              </div>
              <div className="nbh-metric-col">
                <span className="nbh-metric-num">5 Bots</span>
                <span className="nbh-metric-sub">Autonomous Traders</span>
              </div>
              <div className="nbh-metric-col">
                <span className="nbh-metric-num">100%</span>
                <span className="nbh-metric-sub">Zero-Prediction Charts</span>
              </div>
              <div className="nbh-metric-col">
                <span className="nbh-metric-num">₹0 Free</span>
                <span className="nbh-metric-sub">Institutional Simulator</span>
              </div>
            </div>

            {/* Interactive Hero Terminal Preview */}
            <div className="nbh-terminal-card" onClick={onGetStarted}>
              <div className="nbh-terminal-top">
                <div className="nbh-terminal-controls">
                  <span className="nbh-t-dot red"></span>
                  <span className="nbh-t-dot yellow"></span>
                  <span className="nbh-t-dot green"></span>
                </div>
                <div className="nbh-terminal-address">tradex.io/terminal/live</div>
                <div className="nbh-terminal-stat">
                  <span className="nbh-pulse-live"></span>
                  <span>MATCHING ENGINE: 1,420 TPS</span>
                </div>
              </div>

              <div className="nbh-terminal-viewport">
                {/* Left Watchlist */}
                <div className="nbh-tv-left">
                  <div className="nbh-tv-head">
                    <span>LIVE ASSETS</span>
                    <span className="nbh-tv-badge">5 BOTS</span>
                  </div>
                  <div className="nbh-tv-list">
                    {heroCompanies.map((c) => (
                      <div
                        key={c.symbol}
                        className={`nbh-tv-item ${activeHeroTab === c.symbol ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHeroTab(c.symbol);
                        }}
                      >
                        <div className="nbh-tvi-left">
                          <span className="nbh-tvi-sym">{c.symbol}</span>
                          <span className="nbh-tvi-sub">{c.stage}</span>
                        </div>
                        <div className="nbh-tvi-right">
                          <span className="nbh-tvi-price">{c.price}</span>
                          <span className="nbh-tvi-chg up">{c.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center Graph */}
                <div className="nbh-tv-center">
                  <div className="nbh-tvc-header">
                    <div>
                      <div className="nbh-tvc-title-row">
                        <span className="nbh-tvc-title">{activeComp.name}</span>
                        <span className="nbh-pill-tag cyan">{activeComp.stage}</span>
                        <span className="nbh-pill-tag yellow">{activeComp.market}</span>
                      </div>
                      <div className="nbh-tvc-price-row">
                        <span className="nbh-tvc-price">{activeComp.price}</span>
                        <span className="nbh-tvc-chg up">{activeComp.change}</span>
                        <span className="nbh-pill-tag coral">Tavily AI Risk: Low Beta</span>
                      </div>
                    </div>

                    <div className="nbh-tvc-timeframes">
                      {['1D', '1W', '1M', '1Y', '5Y'].map((tf) => (
                        <span
                          key={tf}
                          className={`nbh-tvc-tf ${heroTimeframe === tf ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeroTimeframe(tf);
                          }}
                        >
                          {tf}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Terminal Stats Sub-Bar */}
                  <div className="nbh-chart-subbar">
                    <div className="nbh-csb-item">
                      <span className="nbh-csb-label">HIGH</span>
                      <span className="nbh-csb-val">
                        {activeComp.symbol.includes('MSFT') || activeComp.symbol.includes('NVDA') ? '$' : '₹'}
                        {parseFloat(activeComp.price.replace(/[^\d.]/g, '') * 1.03).toFixed(2)}
                      </span>
                    </div>
                    <div className="nbh-csb-item">
                      <span className="nbh-csb-label">LOW</span>
                      <span className="nbh-csb-val">
                        {activeComp.symbol.includes('MSFT') || activeComp.symbol.includes('NVDA') ? '$' : '₹'}
                        {parseFloat(activeComp.price.replace(/[^\d.]/g, '') * 0.96).toFixed(2)}
                      </span>
                    </div>
                    <div className="nbh-csb-item">
                      <span className="nbh-csb-label">VOL</span>
                      <span className="nbh-csb-val">2.84M</span>
                    </div>
                    <div className="nbh-csb-item">
                      <span className="nbh-csb-label">EMA (20)</span>
                      <span className="nbh-csb-val cyan">
                        {activeComp.symbol.includes('MSFT') || activeComp.symbol.includes('NVDA') ? '$' : '₹'}
                        {parseFloat(activeComp.price.replace(/[^\d.]/g, '') * 0.985).toFixed(2)}
                      </span>
                    </div>
                    <div className="nbh-csb-item">
                      <span className="nbh-csb-label">RSI (14)</span>
                      <span className="nbh-csb-val">62.4</span>
                    </div>
                  </div>

                  {/* Structured Terminal SVG Graph */}
                  <div className="nbh-tvc-graph">
                    <svg viewBox="0 0 540 180" className="nbh-tvc-svg">
                      <defs>
                        <linearGradient id="chartFillGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F4D35E" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#F4D35E" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines (Horizontal Price Levels) */}
                      <line x1="20" y1="30" x2="490" y2="30" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="495" y="34" fontSize="9" fill="#71717A" fontFamily="var(--nbh-mono)" fontWeight="700">
                        {activeComp.symbol.includes('MSFT') || activeComp.symbol.includes('NVDA') ? '$' : '₹'}
                        {parseFloat(activeComp.price.replace(/[^\d.]/g, '') * 1.04).toFixed(1)}
                      </text>

                      <line x1="20" y1="65" x2="490" y2="65" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="495" y="69" fontSize="9" fill="#71717A" fontFamily="var(--nbh-mono)" fontWeight="700">
                        {activeComp.symbol.includes('MSFT') || activeComp.symbol.includes('NVDA') ? '$' : '₹'}
                        {parseFloat(activeComp.price.replace(/[^\d.]/g, '') * 1.01).toFixed(1)}
                      </text>

                      <line x1="20" y1="100" x2="490" y2="100" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="495" y="104" fontSize="9" fill="#71717A" fontFamily="var(--nbh-mono)" fontWeight="700">
                        {activeComp.symbol.includes('MSFT') || activeComp.symbol.includes('NVDA') ? '$' : '₹'}
                        {parseFloat(activeComp.price.replace(/[^\d.]/g, '') * 0.98).toFixed(1)}
                      </text>

                      <line x1="20" y1="135" x2="490" y2="135" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="495" y="139" fontSize="9" fill="#71717A" fontFamily="var(--nbh-mono)" fontWeight="700">
                        {activeComp.symbol.includes('MSFT') || activeComp.symbol.includes('NVDA') ? '$' : '₹'}
                        {parseFloat(activeComp.price.replace(/[^\d.]/g, '') * 0.95).toFixed(1)}
                      </text>

                      {/* Vertical Grid Lines & Time Ticks */}
                      <line x1="30" y1="20" x2="30" y2="145" stroke="#F4F4F5" strokeWidth="1" />
                      <text x="30" y="160" fontSize="9" fill="#A1A1AA" fontFamily="var(--nbh-mono)" fontWeight="700" textAnchor="middle">09:30</text>

                      <line x1="145" y1="20" x2="145" y2="145" stroke="#F4F4F5" strokeWidth="1" />
                      <text x="145" y="160" fontSize="9" fill="#A1A1AA" fontFamily="var(--nbh-mono)" fontWeight="700" textAnchor="middle">11:00</text>

                      <line x1="260" y1="20" x2="260" y2="145" stroke="#F4F4F5" strokeWidth="1" />
                      <text x="260" y="160" fontSize="9" fill="#A1A1AA" fontFamily="var(--nbh-mono)" fontWeight="700" textAnchor="middle">12:30</text>

                      <line x1="375" y1="20" x2="375" y2="145" stroke="#F4F4F5" strokeWidth="1" />
                      <text x="375" y="160" fontSize="9" fill="#A1A1AA" fontFamily="var(--nbh-mono)" fontWeight="700" textAnchor="middle">14:00</text>

                      <line x1="490" y1="20" x2="490" y2="145" stroke="#F4F4F5" strokeWidth="1" />
                      <text x="490" y="160" fontSize="9" fill="#A1A1AA" fontFamily="var(--nbh-mono)" fontWeight="700" textAnchor="middle">15:30</text>

                      {/* Volume Histogram (Sub-panel at bottom) */}
                      {[
                        { x: 30, h: 14, up: true },
                        { x: 55, h: 22, up: false },
                        { x: 80, h: 18, up: true },
                        { x: 105, h: 32, up: true },
                        { x: 130, h: 12, up: false },
                        { x: 155, h: 28, up: true },
                        { x: 180, h: 36, up: true },
                        { x: 205, h: 20, up: false },
                        { x: 230, h: 44, up: true },
                        { x: 255, h: 26, up: false },
                        { x: 280, h: 34, up: true },
                        { x: 305, h: 16, up: false },
                        { x: 330, h: 42, up: true },
                        { x: 355, h: 30, up: true },
                        { x: 380, h: 48, up: true },
                        { x: 405, h: 24, up: false },
                        { x: 430, h: 52, up: true },
                        { x: 455, h: 38, up: true },
                        { x: 480, h: 58, up: true },
                      ].map((bar, idx) => (
                        <rect
                          key={idx}
                          x={bar.x - 5}
                          y={145 - bar.h}
                          width="10"
                          height={bar.h}
                          fill={bar.up ? '#10B981' : '#EF4444'}
                          opacity="0.35"
                          rx="1.5"
                        />
                      ))}

                      {/* Area Gradient Under Curve */}
                      <path
                        d="M 30,122 L 65,115 L 100,128 L 135,102 L 170,110 L 205,88 L 240,94 L 275,76 L 310,82 L 345,62 L 380,68 L 415,48 L 450,54 L 490,32 L 490,145 L 30,145 Z"
                        fill="url(#chartFillGrad)"
                      />

                      {/* 20 EMA Smooth Trajectory Line */}
                      <path
                        d="M 30,126 C 140,118 250,96 360,70 C 420,56 460,46 490,38"
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="2"
                        strokeDasharray="4,3"
                        opacity="0.8"
                      />

                      {/* Main Structured Price Path (Realistic High-Frequency Swings) */}
                      <path
                        d="M 30,122 L 65,115 L 100,128 L 135,102 L 170,110 L 205,88 L 240,94 L 275,76 L 310,82 L 345,62 L 380,68 L 415,48 L 450,54 L 490,32"
                        fill="none"
                        stroke="#18181B"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Active Tracking Crosshairs at current price point */}
                      <line x1="20" y1="32" x2="490" y2="32" stroke="#EE6352" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.6" />
                      <line x1="490" y1="20" x2="490" y2="145" stroke="#EE6352" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.6" />

                      {/* Current Live Pulse Anchor */}
                      <circle cx="490" cy="32" r="7" fill="#EE6352" stroke="#18181B" strokeWidth="2.5" />
                      <circle cx="490" cy="32" r="14" fill="#EE6352" opacity="0.25">
                        <animate attributeName="r" values="7;18;7" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  </div>
                </div>

                {/* Right Order Book */}
                <div className="nbh-tv-right">
                  <div className="nbh-tvr-head">
                    <span>ORDER BOOK DEPTH</span>
                    <span className="nbh-tvr-latency">&lt; 1.8ms</span>
                  </div>
                  <div className="nbh-tvr-rows">
                    <div className="nbh-tvr-row ask">
                      <span>149.20</span>
                      <span>1,500</span>
                      <span className="nbh-bar-fill ask" style={{ width: '65%' }}></span>
                    </div>
                    <div className="nbh-tvr-row ask">
                      <span>148.90</span>
                      <span>850</span>
                      <span className="nbh-bar-fill ask" style={{ width: '40%' }}></span>
                    </div>
                    <div className="nbh-tvr-row spread">
                      <span>SPREAD: 0.10</span>
                      <span>MID: 148.50</span>
                    </div>
                    <div className="nbh-tvr-row bid">
                      <span>148.40</span>
                      <span>1,200</span>
                      <span className="nbh-bar-fill bid" style={{ width: '55%' }}></span>
                    </div>
                    <div className="nbh-tvr-row bid">
                      <span>148.10</span>
                      <span>2,400</span>
                      <span className="nbh-bar-fill bid" style={{ width: '85%' }}></span>
                    </div>
                  </div>

                  <div className="nbh-tvr-bottom">
                    <button className="nbh-btn-trade-launch">
                      Execute Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. BENTO GRID OF FEATURES ── */}
      <section id="features-bento" className="nbh-section bg-cream">
        <div className="nbh-container">
          <div className="nbh-section-head">
            <span className="nbh-section-tag yellow">ARCHITECTED FOR PRECISION & VELOCITY</span>
            <h2 className="nbh-section-title">Everything You Need to Analyze, Simulate & Outperform</h2>
            <p className="nbh-section-sub">
              Built with a microsecond in-memory FIFO priority matching engine, dual-currency startup radar, and autonomous bot liquidity.
            </p>
          </div>

          <div className="nbh-bento-grid">
            {/* Card 1: Span 2 - Core Engine */}
            <div className="nbh-bento-card span-2 bg-dark" onClick={onGetStarted}>
              <div className="nbh-card-badge cyan">CORE ARCHITECTURE</div>
              <h3 className="nbh-card-title text-white">Sub-Millisecond Order Matching & Limit Books</h3>
              <p className="nbh-card-text text-light">
                In-memory FIFO price-time priority matching engine executing Limit, Market, and Stop-Loss orders with sub-2ms precision and zero artificial latency.
              </p>

              <div className="nbh-engine-flow">
                <div className="nbh-flow-step">
                  <span className="nbh-flow-idx">01</span>
                  <span className="nbh-flow-title">Order Ingestion</span>
                  <span className="nbh-flow-sub">Limit / Market</span>
                </div>
                <span className="nbh-flow-arrow">→</span>
                <div className="nbh-flow-step active">
                  <span className="nbh-flow-idx">02</span>
                  <span className="nbh-flow-title">Price-Time FIFO</span>
                  <span className="nbh-flow-sub">Microsecond Queue</span>
                </div>
                <span className="nbh-flow-arrow">→</span>
                <div className="nbh-flow-step">
                  <span className="nbh-flow-idx">03</span>
                  <span className="nbh-flow-title">Instant Fill</span>
                  <span className="nbh-flow-sub">&lt; 1.8ms Execution</span>
                </div>
              </div>
            </div>

            {/* Card 2: Indian Startups & IPOs */}
            <div className="nbh-bento-card bg-yellow" onClick={onGetStarted}>
              <div className="nbh-card-badge white">DUAL CURRENCY RADAR</div>
              <h3 className="nbh-card-title">Indian Startups to Global Tech</h3>
              <p className="nbh-card-text">
                Native valuations for early Indian ventures (MeetMux, PlaceMux, KisanAI) in <strong>₹ Cr</strong> alongside NASDAQ mega-caps in <strong>$</strong>.
              </p>
              <div className="nbh-tags-cluster">
                <span className="nbh-mini-pill">₹ Seed Stage</span>
                <span className="nbh-mini-pill">₹ Series A</span>
                <span className="nbh-mini-pill">$ NASDAQ</span>
                <span className="nbh-mini-pill">₹ NSE IPOs</span>
              </div>
            </div>

            {/* Card 3: 5 Bots */}
            <div className="nbh-bento-card bg-cyan" onClick={onGetStarted}>
              <div className="nbh-card-badge white">AUTONOMOUS LIQUIDITY</div>
              <h3 className="nbh-card-title">5 Multi-Agent Simulation Bots</h3>
              <p className="nbh-card-text">
                Algorithmic trading agents (Momentum, Aggressive, Bear, Market Maker, Value) injecting continuous book liquidity.
              </p>
              <div className="nbh-bots-stack">
                <div className="nbh-bot-item">🤖 MarketMaker Bot</div>
                <div className="nbh-bot-item">🚀 Momentum Trader</div>
                <div className="nbh-bot-item">🛡️ Bear Hedger</div>
              </div>
            </div>

            {/* Card 4: Tavily AI */}
            <div className="nbh-bento-card bg-coral" onClick={onGetStarted}>
              <div className="nbh-card-badge white">GENERATIVE INTEL</div>
              <h3 className="nbh-card-title">Tavily AI Risk & Sentiment Engine</h3>
              <p className="nbh-card-text">
                Real-time synthesis of financial filings, breaking news sentiment, customer acquisition risk, and macro volatility.
              </p>
              <div className="nbh-risk-box">
                <div className="nbh-rb-top">
                  <span>AI RISK ASSESSMENT</span>
                  <span>94 / 100</span>
                </div>
                <div className="nbh-rb-track">
                  <div className="nbh-rb-bar" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 5: High-Precision Spline Trajectory */}
            <div className="nbh-bento-card bg-white" onClick={onGetStarted}>
              <div className="nbh-card-badge yellow">ZERO HALLUCINATION</div>
              <h3 className="nbh-card-title">Precision Spline Trajectory</h3>
              <p className="nbh-card-text">
                Realistic continuous price curves anchored to current time with zero future prediction or artificial gaps. Supports 1D to 5Y historical bounds.
              </p>
              <div className="nbh-chart-metrics-row">
                <div className="nbh-cm-item">
                  <span className="nbh-cm-tf">1D Intraday</span>
                  <span className="nbh-cm-val up">+8.40%</span>
                </div>
                <div className="nbh-cm-item">
                  <span className="nbh-cm-tf">1Y Growth</span>
                  <span className="nbh-cm-val up">+118.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SPEED, LIMITS & BENCHMARK MATRIX ── */}
      <section id="benchmark-matrix" className="nbh-section bg-offwhite">
        <div className="nbh-container">
          <div className="nbh-section-head">
            <span className="nbh-section-tag coral">UNMATCHED EXECUTION & PRIORITY</span>
            <h2 className="nbh-section-title">Why TradeX Beats Traditional Brokers & Legacy Terminals</h2>
            <p className="nbh-section-sub">
              Compare our in-memory engine latency, startup intelligence, and multi-bot liquidity against conventional platforms.
            </p>
          </div>

          <div className="nbh-matrix-card">
            <table className="nbh-compare-table">
              <thead>
                <tr>
                  <th className="nbh-th-capability">Engine Capability & Limits</th>
                  <th className="nbh-th-ts">
                    <div className="nbh-ts-badge">TRADEX</div>
                    <span>Our Engine</span>
                  </th>
                  <th className="nbh-th-std">Traditional Brokers (Zerodha / Robinhood)</th>
                  <th className="nbh-th-std">Generic Paper Apps</th>
                  <th className="nbh-th-std">Legacy Terminals (Bloomberg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="nbh-td-title">
                    <strong>Matching Engine Latency</strong>
                    <span className="nbh-td-sub">Time to execute order across queue</span>
                  </td>
                  <td className="nbh-td-winner">
                    <span className="nbh-win-tag">&lt; 1.8ms In-Memory</span>
                  </td>
                  <td className="nbh-td-val">250ms - 800ms Network Hop</td>
                  <td className="nbh-td-val">500ms Simulated Lag</td>
                  <td className="nbh-td-val">10ms - 50ms Dedicated Line</td>
                </tr>

                <tr>
                  <td className="nbh-td-title">
                    <strong>Priority Limit Order Book</strong>
                    <span className="nbh-td-sub">Price-Time FIFO microsecond sorting</span>
                  </td>
                  <td className="nbh-td-winner">
                    <span className="nbh-win-tag">✓ Microsecond FIFO</span>
                  </td>
                  <td className="nbh-td-val">Standard Batch Queue</td>
                  <td className="nbh-td-val">Instant Fake Fill (No Book)</td>
                  <td className="nbh-td-val">L2/L3 Feed Queue</td>
                </tr>

                <tr>
                  <td className="nbh-td-title">
                    <strong>Indian Startups & Pre-IPO Data</strong>
                    <span className="nbh-td-sub">Seed, Series A & Unicorn coverage</span>
                  </td>
                  <td className="nbh-td-winner">
                    <span className="nbh-win-tag">✓ Native (₹ Cr Valuations)</span>
                  </td>
                  <td className="nbh-td-val">✕ Public Equities Only</td>
                  <td className="nbh-td-val">✕ US Stocks Only</td>
                  <td className="nbh-td-val">✕ Requires $15k PE Addon</td>
                </tr>

                <tr>
                  <td className="nbh-td-title">
                    <strong>Autonomous Multi-Agent Bots</strong>
                    <span className="nbh-td-sub">5 Algorithmic simulation bots</span>
                  </td>
                  <td className="nbh-td-winner">
                    <span className="nbh-win-tag">✓ 5 Multi-Agent Bots</span>
                  </td>
                  <td className="nbh-td-val">✕ None (Manual Only)</td>
                  <td className="nbh-td-val">✕ Random Static Jitter</td>
                  <td className="nbh-td-val">✕ Requires Custom Python</td>
                </tr>

                <tr>
                  <td className="nbh-td-title">
                    <strong>Real-Time AI Risk Synthesizer</strong>
                    <span className="nbh-td-sub">Tavily AI & Finnhub live news feeds</span>
                  </td>
                  <td className="nbh-td-winner">
                    <span className="nbh-win-tag">✓ Real-Time Tavily AI</span>
                  </td>
                  <td className="nbh-td-val">Delayed PDF Research</td>
                  <td className="nbh-td-val">✕ None</td>
                  <td className="nbh-td-val">Expensive Premium Feed</td>
                </tr>

                <tr>
                  <td className="nbh-td-title">
                    <strong>Dual Currency Intelligence</strong>
                    <span className="nbh-td-sub">Instant USD ($) & INR (₹) routing</span>
                  </td>
                  <td className="nbh-td-winner">
                    <span className="nbh-win-tag">✓ Instant $ & ₹ Sync</span>
                  </td>
                  <td className="nbh-td-val">Single Country Currency</td>
                  <td className="nbh-td-val">USD Only</td>
                  <td className="nbh-td-val">Complex Multi-Account</td>
                </tr>

                <tr>
                  <td className="nbh-td-title">
                    <strong>Pricing & Access</strong>
                    <span className="nbh-td-sub">Platform cost and accessibility</span>
                  </td>
                  <td className="nbh-td-winner">
                    <span className="nbh-win-tag">100% Free & Open</span>
                  </td>
                  <td className="nbh-td-val">Brokerage & Depository Fees</td>
                  <td className="nbh-td-val">Freemium Paywalls</td>
                  <td className="nbh-td-val">$24,000 / User / Year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 4. CALL TO ACTION ── */}
      <section className="nbh-section bg-cream">
        <div className="nbh-container">
          <div className="nbh-cta-card">
            <span className="nbh-pill-tag yellow" style={{ marginBottom: 16 }}>
              INSTITUTIONAL SIMULATION
            </span>
            <h2 className="nbh-cta-title">Experience High-Velocity Trade Execution Today</h2>
            <p className="nbh-cta-desc">
              No account barriers or brokerage delays. Evaluate Indian startups in ₹ alongside US stocks in $, inspect AI risk metrics, and match orders in real-time.
            </p>
            <div className="nbh-cta-btn-wrap">
              <button className="nbh-btn-lg primary-coral" onClick={onGetStarted}>
                <span>Launch TradeX Terminal</span>
                <span className="nbh-arrow">↗</span>
              </button>
            </div>
            <div className="nbh-cta-footer-tags">
              <span className="nbh-mini-pill">● Live Market Synced</span>
              <span className="nbh-mini-pill">● In-Memory Core Online</span>
              <span className="nbh-mini-pill">● Zero-Prediction Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. MONUMENTAL TRADEX WORDMARK FOOTER (GANDER-STYLE) ── */}
      <footer className="nbh-gander-footer">
        <div className="nbh-container">
          <div className="nbh-gf-box" onClick={onGetStarted}>
            <div className="nbh-gf-wordmark">TRADEX</div>
          </div>
          <div className="nbh-gf-bar">
            <div className="nbh-gf-status">
              <span className="nbh-status-dot"></span>
              <span>ALL SYSTEMS OPERATIONAL · SUB-2MS IN-MEMORY ENGINE</span>
            </div>
            <div className="nbh-gf-copy">
              <span>© {new Date().getFullYear()} TRADEX · HIGH-FREQUENCY TERMINAL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
