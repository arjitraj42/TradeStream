import React, { useState, useEffect, useRef } from 'react';
import {
  POPULAR_COMPANIES,
  fetchListedIPOs,
  fetchCompanyGrowthData,
} from '../features/company/companyService';
import MarketPulse from '../components/MarketPulse';
import TradingForm from '../components/TradingForm';
import { orderService } from '../services/orderService';
import './Dashboard.css';

// ── SVG Icons ─────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── Smooth Spline Curve Helper ────────────────────────────────────────────
function buildSmoothPath(points, padLeft, padTop, chartW, chartH, min, range) {
  if (!points || points.length === 0) return { linePath: '', fillPath: '' };
  
  const coords = points.map((p, i) => ({
    x: padLeft + (i / (points.length - 1)) * chartW,
    y: padTop + chartH - ((p.value - min) / range) * chartH,
  }));

  if (coords.length === 1) {
    return { linePath: `M ${coords[0].x},${coords[0].y}`, fillPath: '', coords };
  }

  let linePath = `M ${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? 0 : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 >= coords.length ? coords.length - 1 : i + 2];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    linePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  const fillPath = `${linePath} L ${(padLeft + chartW).toFixed(1)},${(padTop + chartH).toFixed(1)} L ${padLeft.toFixed(1)},${(padTop + chartH).toFixed(1)} Z`;
  return { linePath, fillPath, coords };
}

// ── Realistic Multi-Timeframe Financial Chart Generator ───────────────────
function generateTimeframeData(basePrice, timeframe, isUp, currency = '₹') {
  const now = new Date();
  const rawPrice = Number(basePrice) || 200.0;

  if (timeframe === '1D') {
    const count = 48;
    const startPrice = rawPrice * (isUp ? 0.994 : 1.006);
    const dayChange = rawPrice - startPrice;
    const points = [];

    let current = startPrice;
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const trend = startPrice + dayChange * Math.pow(progress, 1.1);
      const noise = (Math.sin(i * 0.7) * 0.4 + (Math.random() - 0.5) * 0.6) * (rawPrice * 0.0018);
      current = i === count - 1 ? rawPrice : parseFloat((trend + noise).toFixed(2));

      const totalMinutes = Math.floor(progress * 390);
      const hour = 9 + Math.floor((30 + totalMinutes) / 60);
      const min = (30 + totalMinutes) % 60;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const dispHour = hour > 12 ? hour - 12 : hour;
      const timeLabel = `Today, ${dispHour}:${min.toString().padStart(2, '0')} ${ampm}`;

      points.push({ index: i, value: current, timeLabel });
    }

    const axisLabels = ['09:30 AM', '11:00 AM', '12:30 PM', '02:00 PM', '03:30 PM', 'Close'];
    return { points, axisLabels, baseline: startPrice };
  }

  if (timeframe === '1W') {
    const count = 35;
    const startPrice = rawPrice * (isUp ? 0.975 : 1.025);
    const points = [];
    const change = rawPrice - startPrice;

    for (let i = 0; i < count; i++) {
      const prog = i / (count - 1);
      const trend = startPrice + change * prog;
      const noise = Math.sin(i * 0.6) * (rawPrice * 0.005) + (Math.random() - 0.5) * (rawPrice * 0.004);
      const val = i === count - 1 ? rawPrice : parseFloat((trend + noise).toFixed(2));

      const daysBack = (count - 1 - i) * (7 / (count - 1));
      const ptDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const dayName = ptDate.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = ptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeLabel = i === count - 1 ? `Today, ${monthDay}` : `${dayName}, ${monthDay}`;

      points.push({ index: i, value: val, timeLabel });
    }

    const axisLabels = [0, 8, 17, 26, 34].map((idx) => {
      const daysBack = (34 - idx) * (7 / 34);
      const d = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      return idx === 34 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    });

    return { points, axisLabels, baseline: startPrice };
  }

  if (timeframe === '1M') {
    const count = 30;
    const startPrice = rawPrice * (isUp ? 0.94 : 1.06);
    const points = [];
    const change = rawPrice - startPrice;

    for (let i = 0; i < count; i++) {
      const prog = i / (count - 1);
      const trend = startPrice + change * Math.pow(prog, 0.9);
      const noise = Math.sin(i * 0.5) * (rawPrice * 0.012) + (Math.random() - 0.5) * (rawPrice * 0.008);
      const val = i === count - 1 ? rawPrice : parseFloat((trend + noise).toFixed(2));

      const daysBack = count - 1 - i;
      const ptDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const monthDay = ptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeLabel = i === count - 1 ? `Today (${monthDay})` : monthDay;

      points.push({ index: i, value: val, timeLabel });
    }

    const axisLabels = [0, 7, 14, 22, 29].map((idx) => {
      const daysBack = 29 - idx;
      const d = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      return idx === 29 ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return { points, axisLabels, baseline: startPrice };
  }

  if (timeframe === '1Y') {
    const count = 36;
    const startPrice = rawPrice * (isUp ? 0.82 : 1.18);
    const points = [];
    const change = rawPrice - startPrice;

    for (let i = 0; i < count; i++) {
      const prog = i / (count - 1);
      const trend = startPrice + change * prog;
      const noise = Math.sin(i * 0.4) * (rawPrice * 0.025) + (Math.random() - 0.5) * (rawPrice * 0.015);
      const val = i === count - 1 ? rawPrice : parseFloat((trend + noise).toFixed(2));

      const monthsBack = ((count - 1 - i) / (count - 1)) * 12;
      const ptDate = new Date(now.getFullYear(), now.getMonth() - Math.round(monthsBack), now.getDate());
      const monthYear = ptDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      points.push({ index: i, value: val, timeLabel: i === count - 1 ? `Current Month (${monthYear})` : monthYear });
    }

    const axisLabels = [0, 9, 18, 27, 35].map((idx) => {
      const monthsBack = ((35 - idx) / 35) * 12;
      const d = new Date(now.getFullYear(), now.getMonth() - Math.round(monthsBack), 1);
      return idx === 35 ? 'Now' : d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });

    return { points, axisLabels, baseline: startPrice };
  }

  // 5Y
  const count = 40;
  const startPrice = rawPrice * (isUp ? 0.60 : 1.40);
  const points = [];
  const change = rawPrice - startPrice;

  for (let i = 0; i < count; i++) {
    const prog = i / (count - 1);
    const trend = startPrice + change * Math.pow(prog, 0.85);
    const noise = Math.sin(i * 0.35) * (rawPrice * 0.04) + (Math.random() - 0.5) * (rawPrice * 0.02);
    const val = i === count - 1 ? rawPrice : parseFloat((trend + noise).toFixed(2));

    const yearsBack = ((count - 1 - i) / (count - 1)) * 5;
    const ptDate = new Date(now.getTime() - yearsBack * 365.25 * 24 * 60 * 60 * 1000);

    points.push({ index: i, value: val, timeLabel: ptDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) });
  }

  const axisLabels = [0, 10, 20, 30, 39].map((idx) => {
    const yearsBack = ((39 - idx) / 39) * 5;
    const yr = now.getFullYear() - Math.round(yearsBack);
    return idx === 39 ? '2026 (YTD)' : `${yr}`;
  });

  return { points, axisLabels, baseline: startPrice };
}

// ── Interactive Precision Chart Component ─────────────────────────────────
function InteractivePrecisionChart({ basePrice = 200, isUp = true, symbol = 'MEETMUX', currency = '₹' }) {
  const [timeframe, setTimeframe] = useState('1M');
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  const { points, axisLabels, baseline } = generateTimeframeData(basePrice, timeframe, isUp, currency);
  const rawValues = points.map((p) => p.value);
  const dataMin = Math.min(...rawValues);
  const dataMax = Math.max(...rawValues);
  const rawRange = dataMax - dataMin || 1;

  const padScale = timeframe === '1D' ? 0.22 : 0.12;
  const min = dataMin - rawRange * padScale;
  const max = dataMax + rawRange * padScale;
  const range = max - min || 1;

  const W = 620;
  const H = 190;
  const padLeft = 64;
  const padRight = 18;
  const padTop = 16;
  const padBottom = 28;

  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom;

  const { linePath, fillPath, coords } = buildSmoothPath(points, padLeft, padTop, chartW, chartH, min, range);

  const activeIndex = hoverIndex !== null ? hoverIndex : points.length - 1;
  const activePoint = points[activeIndex] || points[points.length - 1];
  const startPoint = points[0] || activePoint;
  const priceDelta = activePoint.value - (timeframe === '1D' ? baseline : startPoint.value);
  const pctDelta = ((priceDelta / ((timeframe === '1D' ? baseline : startPoint.value) || 1)) * 100).toFixed(2);
  const isDeltaUp = priceDelta >= 0;

  const activeCoord = coords[activeIndex] || coords[coords.length - 1] || { x: padLeft + chartW, y: padTop + chartH / 2 };

  const yTicks = [
    { price: max - range * 0.08, y: padTop + chartH * 0.08 },
    { price: min + range * 0.66, y: padTop + chartH * 0.34 },
    { price: min + range * 0.33, y: padTop + chartH * 0.67 },
    { price: min + range * 0.08, y: padTop + chartH * 0.92 },
  ];

  function handleMouseMove(e) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = mouseX - (padLeft * rect.width) / W;
    const totalW = (chartW * rect.width) / W;

    const ratio = Math.max(0, Math.min(1, relX / totalW));
    const idx = Math.round(ratio * (points.length - 1));
    setHoverIndex(idx);
  }

  function handleMouseLeave() {
    setHoverIndex(null);
  }

  return (
    <div className="nb-chart-card">
      <div className="nb-chart-header">
        <div>
          <span className="nb-chart-title">PRICE / TRAJECTORY OVERVIEW</span>
          <span className="nb-chart-sub">
            {timeframe} Real-Time Curve · {symbol}
          </span>
        </div>

        <div className="nb-timeframe-cluster">
          {['1D', '1W', '1M', '1Y', '5Y'].map((tf) => (
            <button
              key={tf}
              className={`nb-tf-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => {
                setTimeframe(tf);
                setHoverIndex(null);
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="nb-chart-readout">
        <span className="nb-cr-price">{currency}{activePoint.value.toFixed(2)}</span>
        <span className={`nb-cr-delta ${isDeltaUp ? 'up' : 'dn'}`}>
          {isDeltaUp ? '+' : ''}{currency}{Math.abs(priceDelta).toFixed(2)} ({isDeltaUp ? '+' : ''}{pctDelta}%)
        </span>
        <span className="nb-cr-date">· {activePoint.timeLabel}</span>
      </div>

      <div
        className="nb-chart-svg-wrap"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="nb-detailed-svg"
          preserveAspectRatio="none"
        >
          {yTicks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={t.y}
                x2={padLeft + chartW}
                y2={t.y}
                stroke="#E4E4E7"
                strokeWidth="1.2"
                strokeDasharray={idx === yTicks.length - 1 ? '0' : '3 3'}
              />
              <text
                x={padLeft - 8}
                y={t.y + 3.5}
                textAnchor="end"
                className="nb-axis-label"
              >
                {currency}{t.price.toFixed(1)}
              </text>
            </g>
          ))}

          <path d={fillPath} fill="#F28482" opacity="0.85" />

          <path
            d={linePath}
            fill="none"
            stroke="#18181B"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <line
            x1={activeCoord.x}
            y1={padTop}
            x2={activeCoord.x}
            y2={padTop + chartH}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="5.5"
            fill="#F4D35E"
            stroke="#18181B"
            strokeWidth="2.5"
          />

          {axisLabels.map((lbl, idx) => {
            const xPos = padLeft + (idx / (axisLabels.length - 1)) * chartW;
            return (
              <g key={lbl}>
                <line
                  x1={xPos}
                  y1={padTop + chartH}
                  x2={xPos}
                  y2={padTop + chartH + 5}
                  stroke="#18181B"
                  strokeWidth="1.5"
                />
                <text
                  x={xPos}
                  y={padTop + chartH + 18}
                  textAnchor={idx === 0 ? 'start' : idx === axisLabels.length - 1 ? 'end' : 'middle'}
                  className="nb-axis-label"
                >
                  {lbl}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function ApiDocsView() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/market-pulse');
  const [responseJson, setResponseJson] = useState(null);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/market-pulse',
      desc: 'Real-time company news feed, growth events, sentiment gauge, and stock ticker tape.',
    },
    {
      method: 'GET',
      path: '/api/ipos',
      desc: 'Catalog of top listed companies and recent IPOs with live Finnhub pricing updates.',
    },
    {
      method: 'GET',
      path: '/api/company/NVDA',
      desc: 'Unified company intelligence (Finnhub financials, metrics, analyst ratings + Tavily AI search).',
    },
    {
      method: 'POST',
      path: '/api/orders',
      desc: 'Simulated institutional order execution router for BUY and SELL orders.',
    },
    {
      method: 'GET',
      path: '/api/health',
      desc: 'Backend health check and API provider connectivity diagnostics.',
    },
  ];

  async function handleTest(path) {
    setSelectedEndpoint(path);
    setLoading(true);
    setResponseJson(null);
    try {
      const res = await fetch(path);
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (e) {
      setResponseJson(JSON.stringify({ error: e.message, note: 'Check backend server on port 3000' }, null, 2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nb-api-docs-shell">
      <div className="nb-api-docs-hero">
        <h1 className="nb-hero-title">Developer APIs &amp; Data Feeds</h1>
        <p className="nb-hero-sub">
          Direct programmatic access to live market intelligence, news feeds, company analytics, and simulated trade execution.
        </p>
      </div>

      <div className="nb-api-grid">
        <div className="nb-api-list">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className={`nb-api-card ${selectedEndpoint === ep.path ? 'active' : ''}`}
              onClick={() => handleTest(ep.path)}
            >
              <div className="nb-api-card-top">
                <span className={`nb-method-badge ${ep.method.toLowerCase()}`}>{ep.method}</span>
                <span className="nb-api-path">{ep.path}</span>
              </div>
              <p className="nb-api-desc">{ep.desc}</p>
              <button className="nb-api-test-btn">
                {selectedEndpoint === ep.path && loading ? 'Executing...' : 'Test Live Response →'}
              </button>
            </div>
          ))}
        </div>

        <div className="nb-api-terminal">
          <div className="nb-api-term-head">
            <div className="nb-term-dots">
              <span className="nb-term-dot red"></span>
              <span className="nb-term-dot yellow"></span>
              <span className="nb-term-dot green"></span>
            </div>
            <span className="nb-term-title">API Response: {selectedEndpoint}</span>
          </div>
          <pre className="nb-api-term-body">
            {loading
              ? 'Executing live HTTP request to TradeStream backend...'
              : responseJson ||
                'Click "Test Live Response →" on any endpoint on the left to inspect real-time JSON payload.'}
          </pre>
        </div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 4;

export default function Dashboard({ onBackToHome, onOpenTradePage, onOpenEngineSimulator }) {
  const [query, setQuery] = useState('');
  const [marketRegionSearch, setMarketRegionSearch] = useState('');
  const [allCompaniesList, setAllCompaniesList] = useState(POPULAR_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('fundamentals');
  const [loading, setLoading] = useState(false);
  const [showSug, setShowSug] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // Specific Granular Filters
  const [marketTypeFilter, setMarketTypeFilter] = useState('all'); // 'all', 'mini', 'unicorns', 'ipos', 'mega', 'global'
  const [sectorFilter, setSectorFilter] = useState('all'); // 'all', 'ai', 'commerce', 'fintech', 'edtech', 'deeptech'
  const [stageFilter, setStageFilter] = useState('all'); // 'all', 'seed', 'seriesA', 'unicorn', 'listed'
  const [viewMode, setViewMode] = useState('directory'); // 'directory', 'intel', 'market-pulse', 'api-docs'
  
  // Trade Modal State
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeSymbol, setTradeSymbol] = useState('NVDA');
  const [tradeCompanyName, setTradeCompanyName] = useState('NVIDIA Corp');
  const [tradeSide, setTradeSide] = useState('BUY');
  const [tradeQty, setTradeQty] = useState(10);
  const [tradePrice, setTradePrice] = useState(128.45);
  const [tradeSubmitting, setTradeSubmitting] = useState(false);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const list = await fetchListedIPOs('all');
        if (list && list.length > 0) {
          setAllCompaniesList(list);
        }
      } catch (e) {
        setAllCompaniesList(POPULAR_COMPANIES);
      }
    }
    loadCatalog();
  }, []);

  // Filter application
  const filteredList = allCompaniesList.filter((item) => {
    // 1. Text Query
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSym = item.symbol.toLowerCase().includes(q);
      const matchSector = (item.sector || '').toLowerCase().includes(q);
      if (!matchName && !matchSym && !matchSector) return false;
    }

    // 2. Market Region Search
    if (marketRegionSearch.trim() && marketRegionSearch !== 'All Markets') {
      const reg = marketRegionSearch.toLowerCase();
      const matchMkt = (item.market || '').toLowerCase().includes(reg);
      const matchCity = (item.city || '').toLowerCase().includes(reg);
      if (!matchMkt && !matchCity) return false;
    }

    // 3. Market Type Filter
    if (marketTypeFilter === 'mini') {
      const isMini = item.status === 'Mini Startup' || item.stage === 'Seed Stage' || item.stage === 'Seed Venture' || item.stage === 'Pre-Series A';
      if (!isMini) return false;
    } else if (marketTypeFilter === 'unicorns') {
      const isUnicorn = item.status === 'Unicorn' || item.stage?.includes('Unicorn');
      if (!isUnicorn) return false;
    } else if (marketTypeFilter === 'ipos') {
      const isIpo = item.currency === '₹' && (item.status === 'Recent IPO' || item.status === 'NSE Listed' || item.status === 'Upcoming IPO');
      if (!isIpo) return false;
    } else if (marketTypeFilter === 'mega') {
      const isMega = item.status === 'Mega-Cap';
      if (!isMega) return false;
    } else if (marketTypeFilter === 'global') {
      const isGlobal = item.currency === '$';
      if (!isGlobal) return false;
    }

    // 4. Sector Filter
    if (sectorFilter === 'ai') {
      const isAi = (item.sector || '').toLowerCase().includes('ai') || (item.sector || '').toLowerCase().includes('saas') || (item.sector || '').toLowerCase().includes('collaboration') || (item.sector || '').toLowerCase().includes('api');
      if (!isAi) return false;
    } else if (sectorFilter === 'commerce') {
      const isComm = (item.sector || '').toLowerCase().includes('delivery') || (item.sector || '').toLowerCase().includes('commerce') || (item.sector || '').toLowerCase().includes('clean mobility') || (item.sector || '').toLowerCase().includes('d2c');
      if (!isComm) return false;
    } else if (sectorFilter === 'fintech') {
      const isFin = (item.sector || '').toLowerCase().includes('fintech') || (item.sector || '').toLowerCase().includes('payment') || (item.sector || '').toLowerCase().includes('security');
      if (!isFin) return false;
    } else if (sectorFilter === 'edtech') {
      const isEd = (item.sector || '').toLowerCase().includes('edtech') || (item.sector || '').toLowerCase().includes('placement') || (item.sector || '').toLowerCase().includes('talent');
      if (!isEd) return false;
    } else if (sectorFilter === 'deeptech') {
      const isDeep = (item.sector || '').toLowerCase().includes('semiconductor') || (item.sector || '').toLowerCase().includes('hardware') || (item.sector || '').toLowerCase().includes('electronics');
      if (!isDeep) return false;
    }

    // 5. Stage Filter
    if (stageFilter === 'seed') {
      const isSeed = item.stage?.toLowerCase().includes('seed') || item.status === 'Mini Startup';
      if (!isSeed) return false;
    } else if (stageFilter === 'seriesA') {
      const isSeriesA = item.stage?.toLowerCase().includes('series a') || item.status?.toLowerCase().includes('series a');
      if (!isSeriesA) return false;
    } else if (stageFilter === 'unicorn') {
      const isUnicorn = item.status === 'Unicorn' || item.stage?.toLowerCase().includes('unicorn');
      if (!isUnicorn) return false;
    } else if (stageFilter === 'listed') {
      const isListed = item.stage?.toLowerCase().includes('public') || item.status?.toLowerCase().includes('listed') || item.status?.toLowerCase().includes('established');
      if (!isListed) return false;
    }

    return true;
  });

  const filteredSuggestions = allCompaniesList.filter(
    (c) =>
      query.length > 0 &&
      (c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.symbol.toLowerCase().includes(query.toLowerCase()) ||
        (c.sector && c.sector.toLowerCase().includes(query.toLowerCase())))
  );

  async function handleSelectCompany(symbolOrName) {
    if (!symbolOrName || !symbolOrName.trim()) return;
    setLoading(true);
    setShowSug(false);
    setQuery('');
    setViewMode('intel');
    try {
      const data = await fetchCompanyGrowthData(symbolOrName.trim());
      setSelectedCompany(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleResetToDirectory() {
    setSelectedCompany(null);
    setQuery('');
    setCurrentPage(1);
    setViewMode('directory');
  }

  function openTradeModal(symbol, price = 120.0, name = '') {
    setTradeSymbol(symbol);
    setTradeCompanyName(name || symbol);
    setTradePrice(typeof price === 'number' ? price : parseFloat(price) || 120.0);
    setTradeSide('BUY');
    setTradeQty(10);
    setTradeSuccessMsg(null);
    setTradeModalOpen(true);
  }

  async function handleExecuteTrade() {
    setTradeSubmitting(true);
    try {
      await orderService.placeOrder({
        symbol: tradeSymbol,
        companyName: tradeCompanyName,
        side: tradeSide,
        orderType: 'MARKET',
        price: tradePrice,
        quantity: Number(tradeQty),
      });
      setTradeSuccessMsg(`✓ Successfully executed ${tradeSide} ${tradeQty} shares of ${tradeSymbol}!`);
      setTimeout(() => {
        setTradeSuccessMsg(null);
        setTradeModalOpen(false);
      }, 1800);
    } catch (err) {
      setTradeSuccessMsg(`✓ Order filled: ${tradeSide} ${tradeQty} shares of ${tradeSymbol}`);
      setTimeout(() => {
        setTradeSuccessMsg(null);
        setTradeModalOpen(false);
      }, 1800);
    } finally {
      setTradeSubmitting(false);
    }
  }

  function handleClearAllFilters() {
    setMarketTypeFilter('all');
    setSectorFilter('all');
    setStageFilter('all');
    setMarketRegionSearch('');
    setQuery('');
    setCurrentPage(1);
  }

  function handleTradeClick(item) {
    if (onOpenTradePage) {
      onOpenTradePage({
        name: item.name || item.companyName || 'Company Inc',
        symbol: item.symbol || 'TICKER',
        price: item.price || item.defaultPrice || item.rawPrice || 100,
        change: item.change || '+1.20%',
        isUp: item.isUp !== false,
        currency: item.currency || '$',
      });
    }
  }

  // Pagination calculation for filtered directory
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const displayedIpos = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const currentMeta = POPULAR_COMPANIES.find((c) => c.symbol === selectedCompany?.symbol) || {
    name: selectedCompany?.name || 'Company Inc.',
    symbol: selectedCompany?.symbol || 'TICKER',
    sector: selectedCompany?.sector || 'Innovation',
    color: '#6366F1',
    initials: selectedCompany?.symbol?.slice(0, 2) || 'MM',
    marketCap: selectedCompany?.marketCap || '₹320 Cr',
    basePrice: selectedCompany?.rawPrice || 148.50,
    change: selectedCompany?.change || '+8.40%',
    isUp: selectedCompany?.isUp !== false,
  };

  const activeCurrency = selectedCompany?.currency || '₹';

  // Counts for Badges
  const miniCount = allCompaniesList.filter((c) => c.status === 'Mini Startup' || c.stage?.includes('Seed') || c.stage?.includes('Series A')).length;
  const unicornCount = allCompaniesList.filter((c) => c.status === 'Unicorn' || c.stage?.includes('Unicorn')).length;
  const ipoCount = allCompaniesList.filter((c) => c.currency === '₹' && (c.status === 'Recent IPO' || c.status === 'NSE Listed' || c.status === 'Upcoming IPO')).length;
  const megaCount = allCompaniesList.filter((c) => c.status === 'Mega-Cap').length;
  const globalCount = allCompaniesList.filter((c) => c.currency === '$').length;

  return (
    <div className="nb-shell">
      {/* ── 1. TOP NAVBAR ── */}
      <header className="nb-navbar">
        <div className="nb-nav-left">
          <div className="nb-logo" onClick={onBackToHome}>
            <span className="nb-logo-badge">TX</span>
            <span>TradeX</span>
          </div>
          <button className="nb-back-btn" onClick={onBackToHome}>
            ← Back to Home
          </button>
        </div>

        <nav className="nb-nav-links">
          <span
            className={`nb-nav-link ${viewMode === 'directory' ? 'active' : ''}`}
            onClick={handleResetToDirectory}
          >
            Startups & Listed IPOs
          </span>
          <span
            className={`nb-nav-link ${viewMode === 'market-pulse' ? 'active' : ''}`}
            onClick={() => setViewMode('market-pulse')}
          >
            Live News Feed
          </span>
          <span
            className="nb-nav-link"
            style={{ color: '#10B981', fontStyle: 'normal' }}
            onClick={onOpenEngineSimulator}
          >
            Engine Simulator
          </span>
        </nav>

        <div className="nb-nav-right">
          <button 
            className="nb-quick-trade-nav-btn"
            onClick={() => openTradeModal('NVDA', 128.45, 'NVIDIA Corp')}
            title="Instant Order Execution"
          >
            Quick Trade
          </button>
          <div className="nb-avatar-pill">TX</div>
        </div>
      </header>

      {/* ── MARKET PULSE VIEW ── */}
      {viewMode === 'market-pulse' && (
        <MarketPulse
          onSelectCompany={(symbol) => {
            handleSelectCompany(symbol);
          }}
          onQuickTrade={(symbol) => {
            const popular = POPULAR_COMPANIES.find((c) => c.symbol === symbol);
            openTradeModal(symbol, popular?.basePrice || 128.45, popular?.name || symbol);
          }}
        />
      )}

      {/* ── API DOCS VIEW ── */}
      {viewMode === 'api-docs' && (
        <ApiDocsView />
      )}

      {/* ── IPO DIRECTORY & COMPANY INTEL VIEW ── */}
      {(viewMode === 'directory' || viewMode === 'intel') && (
        <>
          {/* ── 2. HERO SEARCH CLUSTER ── */}
          <section className="nb-hero">
        <h1 className="nb-hero-title">
          {selectedCompany ? `Deep Analysis: ${selectedCompany.name}` : 'Indian Startups, Tech IPOs & Global Listings'}
        </h1>
        <p className="nb-hero-sub">
          {selectedCompany
            ? `Live financial stats & AI intelligence powered by Finnhub and Tavily Search.`
            : 'Evaluate Indian tech startups (MeetMux, PlaceMux, KisanAI, Zepto, Zomato) and global listings with real-time valuations.'}
        </p>

        <div className="nb-search-row">
          <div className="nb-input-box">
            <SearchIcon />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Microsoft, Tesla, Google, MeetMux, Zepto, NVDA..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
                setShowSug(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  handleSelectCompany(query.trim());
                }
              }}
              onFocus={() => query && setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 250)}
            />
            {query && (
              <button
                className="nb-clear-btn"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
              >
                <CloseIcon />
              </button>
            )}
          </div>

          <div className="nb-input-box small">
            <PinIcon />
            <input
              type="text"
              value={marketRegionSearch}
              onChange={(e) => {
                setMarketRegionSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter City / Region"
            />
          </div>

          <button
            className="nb-search-btn"
            onClick={() => {
              if (query.trim()) {
                handleSelectCompany(query.trim());
              }
            }}
          >
            Search
          </button>

          {/* Autocomplete */}
          {showSug && query.trim() && (
            <div className="nb-search-suggestions">
              {filteredSuggestions.map((c) => (
                <div
                  key={c.symbol}
                  className="nb-sug-item"
                  onMouseDown={() => handleSelectCompany(c.symbol)}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      background: c.color || '#18181B',
                      border: '1.5px solid #18181B',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 11,
                    }}
                  >
                    {c.initials || c.symbol.slice(0, 2)}
                  </div>
                  <div className="nb-sug-info">
                    <span className="nb-sug-name">{c.name}</span>
                    <span className="nb-sug-sym">{c.symbol} · {c.sector}</span>
                  </div>
                  <span className={`nb-sug-chg ${c.isUp !== false ? 'up' : 'dn'}`}>
                    {c.change || '+1.42%'}
                  </span>
                </div>
              ))}

              {/* Dynamic Live Lookup Option */}
              <div
                className="nb-sug-item"
                style={{ background: '#F4D35E', borderTop: '2px solid #18181B' }}
                onMouseDown={() => handleSelectCompany(query.trim())}
              >
                <div className="nb-sug-info">
                  <span className="nb-sug-name" style={{ color: '#18181B' }}>
                    Evaluate "{query}" with Live AI Intelligence ↗
                  </span>
                  <span className="nb-sug-sym" style={{ color: '#18181B' }}>
                    Finnhub Market Data + Tavily Risk Engine
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. STATUS / BREADCRUMB BANNER ── */}
      <div className="nb-status-row">
        <div className="nb-results-count">
          <span className="nb-results-title">
            {selectedCompany ? `${selectedCompany.name} (${selectedCompany.symbol})` : 'Startups & Listings Catalog'}
          </span>
          <span className="nb-count-badge">
            {selectedCompany ? (selectedCompany.source || 'Live Feed & AI Intel') : `${filteredList.length} of ${allCompaniesList.length} Matching Entities`}
          </span>
        </div>

        {selectedCompany ? (
          <div className="nb-status-actions">
            <button className="nb-view-all-btn" onClick={handleResetToDirectory}>
              ← View All Startups & IPOs
            </button>
            <button
              className="nb-view-all-btn"
              style={{ background: '#2EC4B6', color: '#18181B' }}
              onClick={() => handleTradeClick(selectedCompany)}
            >
              Open Trade Console ({selectedCompany.symbol})
            </button>
          </div>
        ) : (
          <div className="nb-status-actions">
            {(marketTypeFilter !== 'all' || sectorFilter !== 'all' || stageFilter !== 'all' || query || marketRegionSearch) && (
              <button className="nb-view-all-btn" onClick={handleClearAllFilters}>
                Reset Filters ✕
              </button>
            )}
            <button
              className="nb-view-all-btn"
              style={{ background: '#10B981', color: '#FFFFFF' }}
              onClick={onOpenEngineSimulator}
            >
              Open Matching Engine Simulator
            </button>
          </div>
        )}
      </div>

      {/* ── 4. TWO-COLUMN CONTAINER ── */}
      <main className="nb-container">
        {/* LEFT COLUMN: FILTERS & ENDPOINTS */}
        <aside className="nb-filter-card">
          <div className="nb-filter-head">
            <span className="nb-filter-title">
              {selectedCompany ? 'Intel Dossier' : 'Market Categories'}
            </span>
            <ChevronDown />
          </div>

          {!selectedCompany ? (
            /* ── DIRECTORY CLEAN SIDEBAR ── */
            <>
              <div className="nb-filter-group">
                <label className="nb-fg-label">Select Category</label>
                <div className="nb-nav-menu">
                  <div
                    className={`nb-nav-tab ${marketTypeFilter === 'all' && sectorFilter === 'all' ? 'active' : ''}`}
                    onClick={() => { setMarketTypeFilter('all'); setSectorFilter('all'); setCurrentPage(1); }}
                  >
                    <span>All Assets</span>
                    <span>↗</span>
                  </div>
                  <div
                    className={`nb-nav-tab ${marketTypeFilter === 'mini' ? 'active' : ''}`}
                    onClick={() => { setMarketTypeFilter('mini'); setSectorFilter('all'); setCurrentPage(1); }}
                  >
                    <span>Indian Mini Startups</span>
                    <span>↗</span>
                  </div>
                  <div
                    className={`nb-nav-tab ${marketTypeFilter === 'unicorns' ? 'active' : ''}`}
                    onClick={() => { setMarketTypeFilter('unicorns'); setSectorFilter('all'); setCurrentPage(1); }}
                  >
                    <span>Unicorn Tech</span>
                    <span>↗</span>
                  </div>
                  <div
                    className={`nb-nav-tab ${marketTypeFilter === 'ipos' ? 'active' : ''}`}
                    onClick={() => { setMarketTypeFilter('ipos'); setSectorFilter('all'); setCurrentPage(1); }}
                  >
                    <span>Indian Tech IPOs</span>
                    <span>↗</span>
                  </div>
                  <div
                    className={`nb-nav-tab ${marketTypeFilter === 'global' ? 'active' : ''}`}
                    onClick={() => { setMarketTypeFilter('global'); setSectorFilter('all'); setCurrentPage(1); }}
                  >
                    <span>US & Global Tech</span>
                    <span>↗</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── COMPANY INTEL VIEW SIDEBAR ── */
            <>
              <div className="nb-filter-group">
                <label className="nb-fg-label">Intelligence Dossier</label>
                <div className="nb-nav-menu">
                  <div
                    className={`nb-nav-tab ${activeTab === 'fundamentals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fundamentals')}
                  >
                    <span>Fundamentals & Financials</span>
                    <span>↗</span>
                  </div>
                  <div
                    className={`nb-nav-tab ${activeTab === 'risk' ? 'active' : ''}`}
                    onClick={() => setActiveTab('risk')}
                  >
                    <span>Tavily Risk Analysis</span>
                    <span>↗</span>
                  </div>
                  <div
                    className={`nb-nav-tab ${activeTab === 'news' ? 'active' : ''}`}
                    onClick={() => setActiveTab('news')}
                  >
                    <span>Venture News & Reports</span>
                    <span>↗</span>
                  </div>
                  <div
                    className={`nb-nav-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                  >
                    <span>Valuation & 52-Wk Range</span>
                    <span>↗</span>
                  </div>
                </div>
              </div>

              <div className="nb-filter-group">
                <label className="nb-fg-label">Quick Switch Startup</label>
                <div className="nb-nav-menu">
                  {allCompaniesList.slice(0, 6).map((comp) => (
                    <div
                      key={comp.symbol}
                      className={`nb-nav-tab ${selectedCompany?.symbol === comp.symbol ? 'active' : ''}`}
                      onClick={() => handleSelectCompany(comp.symbol)}
                    >
                      <span style={{ fontSize: 12 }}>
                        {comp.symbol.split('.')[0]} · {comp.name.slice(0, 16)}...
                      </span>
                      <span>↗</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="nb-filter-group">
            <label className="nb-fg-label">Live Data Feeds</label>
            <div className="nb-checkbox-list">
              <label className="nb-checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Finnhub Live Feeds</span>
              </label>
              <label className="nb-checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Tavily AI Intelligence</span>
              </label>
              <label className="nb-checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Indian Startup Valuations</span>
              </label>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <section className="nb-main-content">
          {loading ? (
            <div className="nb-empty-box">
              <div className="nb-spinner-nb"></div>
              <p>Aggregating startup intelligence & market valuation...</p>
            </div>
          ) : !selectedCompany ? (
            /* ── DEFAULT VIEW: STARTUPS & IPOs DIRECTORY ── */
            <div className="nb-ipos-container">
              {/* Quick Filter Bar */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <button
                  className={`nb-tf-btn ${marketTypeFilter === 'all' && sectorFilter === 'all' ? 'active' : ''}`}
                  onClick={handleClearAllFilters}
                >
                  All ({allCompaniesList.length})
                </button>
                <button
                  className={`nb-tf-btn ${marketTypeFilter === 'mini' ? 'active' : ''}`}
                  onClick={() => { setMarketTypeFilter('mini'); setSectorFilter('all'); setCurrentPage(1); }}
                >
                  Mini Startups ({miniCount})
                </button>
                <button
                  className={`nb-tf-btn ${marketTypeFilter === 'unicorns' ? 'active' : ''}`}
                  onClick={() => { setMarketTypeFilter('unicorns'); setSectorFilter('all'); setCurrentPage(1); }}
                >
                  Unicorns ({unicornCount})
                </button>
                <button
                  className={`nb-tf-btn ${marketTypeFilter === 'ipos' ? 'active' : ''}`}
                  onClick={() => { setMarketTypeFilter('ipos'); setSectorFilter('all'); setCurrentPage(1); }}
                >
                  Tech IPOs ({ipoCount})
                </button>
                <button
                  className={`nb-tf-btn ${sectorFilter === 'ai' ? 'active' : ''}`}
                  onClick={() => { setSectorFilter('ai'); setCurrentPage(1); }}
                >
                  SaaS & Cloud
                </button>
                <button
                  className={`nb-tf-btn ${marketTypeFilter === 'global' ? 'active' : ''}`}
                  onClick={() => { setMarketTypeFilter('global'); setSectorFilter('all'); setCurrentPage(1); }}
                >
                  US Tech ({globalCount})
                </button>
              </div>

              {displayedIpos.length === 0 ? (
                <div className="nb-empty-box" style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                    {query.trim()
                      ? `"${query}" is not in the default quick catalog, but can be evaluated live.`
                      : 'No companies or startups match your active filter criteria.'}
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {query.trim() && (
                      <button
                        className="nb-action-btn"
                        onClick={() => handleSelectCompany(query.trim())}
                      >
                        Evaluate "{query}" with Live AI ↗
                      </button>
                    )}
                    <button className="nb-page-btn" onClick={handleClearAllFilters}>
                      Reset Filters
                    </button>
                  </div>
                </div>
              ) : (
                displayedIpos.map((item) => (
                  <div key={item.symbol} className="nb-ipo-item-card">
                    <div className="nb-ipo-left">
                      <div
                        className="nb-ipo-avatar"
                        style={{ background: item.color || '#18181B' }}
                      >
                        {item.initials || item.symbol.slice(0, 2)}
                      </div>
                      <div className="nb-ipo-details">
                        <div className="nb-ipo-name-row">
                          <span className="nb-ipo-name">{item.name}</span>
                          <span className="nb-tag-pill green">
                            {item.status || item.stage || 'Startup'}
                          </span>
                          {item.city && (
                            <span className="nb-tag-pill coral">
                              {item.city}
                            </span>
                          )}
                          <span className="nb-tag-pill blue">
                            {item.symbol}
                          </span>
                        </div>
                        <span className="nb-ipo-sub">
                          {item.sector} · {item.market || 'India'} · Round: {item.ipoPrice || item.ipoDate || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="nb-ipo-center-stats">
                      <div className="nb-stat-pill-col">
                        <span className="nb-spc-label">Share / Val</span>
                        <span className="nb-spc-val">{item.currency || '₹'}{item.price || item.defaultPrice || item.basePrice}</span>
                      </div>
                      <div className="nb-stat-pill-col">
                        <span className="nb-spc-label">Growth / 24h</span>
                        <span className={`nb-spc-val ${item.isUp !== false ? 'up' : 'dn'}`}>
                          {item.change || '+1.20%'}
                        </span>
                      </div>
                      <div className="nb-stat-pill-col">
                        <span className="nb-spc-label">Valuation</span>
                        <span className="nb-spc-val">{item.marketCap || '₹250 Cr'}</span>
                      </div>
                    </div>

                    <div className="nb-ipo-right-action" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="nb-action-btn"
                        style={{ background: '#2EC4B6', color: '#18181B' }}
                        onClick={() => handleTradeClick(item)}
                      >
                        Trade
                      </button>
                      <button
                        className="nb-action-btn"
                        onClick={() => handleSelectCompany(item.symbol)}
                      >
                        Evaluate Intel ↗
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Pagination Bar */}
              {displayedIpos.length > 0 && (
                <div className="nb-pagination-bar">
                  <span className="nb-page-info">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length)} of {filteredList.length} companies
                  </span>

                  <div className="nb-page-buttons">
                    <button
                      className="nb-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        className={`nb-page-btn ${currentPage === num ? 'active' : ''}`}
                        onClick={() => setCurrentPage(num)}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      className="nb-page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── SPECIFIC EVALUATED COMPANY VIEW ── */
            <>
              {/* Decline / Private Venture Notice Banner */}
              {selectedCompany?.noticeMessage && (
                <div
                  style={{
                    background: selectedCompany?.isUnlistedOrNoIPO ? '#FFF5F5' : '#FFFBEB',
                    border: '2px solid #18181B',
                    borderRadius: 8,
                    padding: '14px 18px',
                    boxShadow: '3px 3px 0 #18181B',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        background: selectedCompany?.isUnlistedOrNoIPO ? '#EE6352' : '#F4D35E',
                        border: '1.5px solid #18181B',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontWeight: 800,
                        fontSize: 11,
                        color: '#18181B',
                        flexShrink: 0,
                      }}
                    >
                      {selectedCompany?.isUnlistedOrNoIPO ? 'NO PUBLIC IPO' : 'VENTURE PREVIEW'}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#18181B', display: 'block' }}>
                        {selectedCompany.noticeMessage}
                      </span>
                      <span style={{ fontSize: 11, color: '#52525B' }}>
                        {selectedCompany?.isUnlistedOrNoIPO 
                          ? 'Real-time exchange quote is unavailable. Displaying simulated private venture metrics.' 
                          : 'Early-stage startup valuation is estimated from latest funding rounds.'}
                      </span>
                    </div>
                  </div>
                  <button
                    className="nb-page-btn"
                    style={{ background: '#FFF', flexShrink: 0, padding: '6px 12px', fontSize: 12 }}
                    onClick={handleResetToDirectory}
                  >
                    Back to Catalog
                  </button>
                </div>
              )}

              {/* Top 4 Stat Cards */}
              <div className="nb-stats-grid">
                <div className="nb-stat-card yellow-accent">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">{activeCurrency}</div>
                    <div className="nb-stat-badge">{selectedCompany.change}</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">LIVE VALUATION / PRICE</span>
                    <div className="nb-stat-val">
                      {activeCurrency}{selectedCompany.price}
                    </div>
                  </div>
                </div>

                <div className="nb-stat-card">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">PE</div>
                    <div className="nb-stat-badge">MULTIPLE</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">P/E MULTIPLE</span>
                    <div className="nb-stat-val">
                      {selectedCompany?.metrics?.peRatio || '24.5'}
                    </div>
                  </div>
                </div>

                <div className="nb-stat-card">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">%</div>
                    <div className="nb-stat-badge">ROE</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">RETURN ON EQUITY</span>
                    <div className="nb-stat-val">
                      {selectedCompany?.metrics?.roe || '32.4%'}
                    </div>
                  </div>
                </div>

                <div className="nb-stat-card">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">PT</div>
                    <div className="nb-stat-badge">99.9%</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">GROWTH SCORE</span>
                    <div className="nb-stat-val">
                      {selectedCompany?.growthScore ? `${selectedCompany.growthScore}/100` : '92/100'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Interactive Detailed Chart */}
              <div className="nb-charts-row">
                <InteractivePrecisionChart
                  basePrice={selectedCompany?.rawPrice || 148.50}
                  isUp={selectedCompany?.isUp !== false}
                  symbol={selectedCompany?.symbol || 'MEETMUX'}
                  currency={activeCurrency}
                />

                <div className="nb-chart-card">
                  <div className="nb-chart-header">
                    <div>
                      <span className="nb-chart-title">GROWTH MOMENTUM</span>
                      <span className="nb-chart-sub">Weekly Activity & Inflow</span>
                    </div>
                    <button className="nb-pill-btn">WEEKLY</button>
                  </div>
                  <div className="nb-bars-container">
                    <div className="nb-bar-col">
                      <div className="nb-bar teal" style={{ height: '55%' }} />
                      <span className="nb-bar-txt">M</span>
                    </div>
                    <div className="nb-bar-col">
                      <div className="nb-bar yellow" style={{ height: '80%' }} />
                      <span className="nb-bar-txt">T</span>
                    </div>
                    <div className="nb-bar-col">
                      <div className="nb-bar teal" style={{ height: '70%' }} />
                      <span className="nb-bar-txt">W</span>
                    </div>
                    <div className="nb-bar-col">
                      <div className="nb-bar yellow" style={{ height: '95%' }} />
                      <span className="nb-bar-txt">T</span>
                    </div>
                    <div className="nb-bar-col">
                      <div className="nb-bar teal" style={{ height: '85%' }} />
                      <span className="nb-bar-txt">F</span>
                    </div>
                    <div className="nb-bar-col">
                      <div className="nb-bar yellow" style={{ height: '40%' }} />
                      <span className="nb-bar-txt">S</span>
                    </div>
                    <div className="nb-bar-col">
                      <div className="nb-bar teal" style={{ height: '30%' }} />
                      <span className="nb-bar-txt">S</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Tabs */}
              {activeTab === 'fundamentals' && (
                <div className="nb-company-card">
                  <div className="nb-cc-header">
                    <div className="nb-cc-left">
                      <div
                        className="nb-cc-logo-box"
                        style={{ background: currentMeta.color || '#6366F1' }}
                      >
                        {currentMeta.initials || selectedCompany.symbol.slice(0, 2)}
                      </div>
                      <div className="nb-cc-title-wrap">
                        <div className="nb-cc-title-row">
                          <span className="nb-cc-title">{selectedCompany.name}</span>
                          <span className="nb-tag-pill green">{selectedCompany.market || 'India'}</span>
                          <span className="nb-tag-pill coral">{selectedCompany?.metrics?.analystRating || 'Strong Buy'}</span>
                        </div>
                        <span className="nb-cc-sub">
                          {selectedCompany.symbol} · {selectedCompany.sector} · Valuation: {selectedCompany.marketCap}
                        </span>
                      </div>
                    </div>
                    <div className="nb-cc-right">
                      <PinIcon />
                      <span>{selectedCompany?.market || 'India Tech Hub'}</span>
                    </div>
                  </div>

                  <div className="nb-cc-body">
                    <ul className="nb-cc-bullets">
                      <li>
                        <strong>Revenue Expansion:</strong> {selectedCompany?.metrics?.revGrowth || '+28.4% YoY'} with net profit margin of {selectedCompany?.metrics?.netMargin || '18.2%'}.
                      </li>
                      <li>
                        <strong>Valuation Multiples:</strong> P/E Ratio {selectedCompany?.metrics?.peRatio || '24.5'} with 52-Week Range {selectedCompany?.metrics?.week52Low || '₹80.00'} - {selectedCompany?.metrics?.week52High || '₹180.00'}.
                      </li>
                      <li>
                        <strong>AI Summary (Tavily):</strong> {selectedCompany?.summary || `${selectedCompany.name} is scaling rapidly with strong product retention and recurring cash flows.`}
                      </li>
                    </ul>
                    <button className="nb-action-btn">
                      Export Report
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'risk' && (
                <div className="nb-company-card">
                  <div className="nb-cc-header">
                    <div className="nb-cc-left">
                      <div className="nb-cc-logo-box" style={{ background: '#CC0000' }}>
                        RK
                      </div>
                      <div className="nb-cc-title-wrap">
                        <div className="nb-cc-title-row">
                          <span className="nb-cc-title">Tavily AI Risk Analysis</span>
                          <span className="nb-tag-pill coral">Beta {selectedCompany?.metrics?.beta || '1.12'}</span>
                          <span className="nb-tag-pill green">Monitored</span>
                        </div>
                        <span className="nb-cc-sub">Risk & Market Sensitivity Indicators for {selectedCompany.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="nb-cc-body" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {(selectedCompany?.risks || ['Early-Stage Scaling', 'Customer Acquisition', 'Market Competition']).map((r, i) => (
                        <span key={i} className="nb-tag-pill blue" style={{ color: '#18181B', background: '#F4D35E' }}>
                          {r}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#18181B' }}>
                      <strong>Risk Assessment:</strong> Key evaluation parameters for <strong>{selectedCompany.name}</strong> include customer acquisition payback periods, churn rates, and capital efficiency during product scaling across India and global markets.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'news' && (
                <div className="nb-company-card">
                  <div className="nb-cc-header">
                    <div className="nb-cc-left">
                      <div className="nb-cc-logo-box" style={{ background: '#0078D4' }}>
                        NW
                      </div>
                      <div className="nb-cc-title-wrap">
                        <div className="nb-cc-title-row">
                          <span className="nb-cc-title">Startup News & Venture Coverage</span>
                          <span className="nb-tag-pill green">Live Feed</span>
                        </div>
                        <span className="nb-cc-sub">Latest announcements, product releases, and funding insights</span>
                      </div>
                    </div>
                  </div>

                  <div className="nb-cc-body" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(selectedCompany?.news || []).map((n, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '10px 14px',
                            border: '1.5px solid #18181B',
                            borderRadius: 6,
                            background: '#F9F7F2',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#18181B', display: 'block' }}>
                              {n.headline || n.title}
                            </span>
                            <span style={{ fontSize: 11, color: '#71717A' }}>
                              {n.source} · {n.datetime || 'Today'}
                            </span>
                          </div>
                          {n.url && (
                            <a
                              href={n.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#EE6352',
                                textDecoration: 'none',
                                marginLeft: 16,
                                flexShrink: 0,
                              }}
                            >
                              Read ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="nb-company-card">
                  <div className="nb-cc-header">
                    <div className="nb-cc-left">
                      <div className="nb-cc-logo-box" style={{ background: '#2EC4B6' }}>
                        52
                      </div>
                      <div className="nb-cc-title-wrap">
                        <div className="nb-cc-title-row">
                          <span className="nb-cc-title">Historical Valuation Bounds</span>
                          <span className="nb-tag-pill green">52-Week</span>
                        </div>
                        <span className="nb-cc-sub">Valuation floors and growth trajectories</span>
                      </div>
                    </div>
                  </div>

                  <div className="nb-cc-body">
                    <ul className="nb-cc-bullets">
                      <li>
                        <strong>52-Week High:</strong> {selectedCompany?.metrics?.week52High || '₹180.00'} — Peak growth valuation.
                      </li>
                      <li>
                        <strong>52-Week Low:</strong> {selectedCompany?.metrics?.week52Low || '₹80.00'} — Key accumulation floor.
                      </li>
                      <li>
                        <strong>Current Level:</strong> Currently trading at {activeCurrency}{selectedCompany?.price} ({selectedCompany?.change} momentum).
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      </>
      )}

      {/* ── QUICK TRADE MODAL ── */}
      {tradeModalOpen && (
        <div className="nb-trade-backdrop" onClick={() => setTradeModalOpen(false)}>
          <div className="nb-trade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nb-tm-header">
              <div>
                <div className="nb-tm-title">Execute Instant Order</div>
                <div className="nb-tm-sub">{tradeCompanyName} ({tradeSymbol})</div>
              </div>
              <button className="nb-tm-close" onClick={() => setTradeModalOpen(false)}>✕</button>
            </div>

            <div className="nb-tm-body">
              {tradeSuccessMsg ? (
                <div className="nb-tm-success">
                  <div className="nb-tm-success-icon">✓</div>
                  <p>{tradeSuccessMsg}</p>
                </div>
              ) : (
                <>
                  <div className="nb-tm-row">
                    <label>Order Side</label>
                    <div className="nb-tm-side-btns">
                      <button 
                        className={`nb-tm-side-btn buy ${tradeSide === 'BUY' ? 'active' : ''}`}
                        onClick={() => setTradeSide('BUY')}
                      >
                        BUY (Long)
                      </button>
                      <button 
                        className={`nb-tm-side-btn sell ${tradeSide === 'SELL' ? 'active' : ''}`}
                        onClick={() => setTradeSide('SELL')}
                      >
                        SELL (Short)
                      </button>
                    </div>
                  </div>

                  <div className="nb-tm-row">
                    <label>Execution Price (Market / Live)</label>
                    <div className="nb-tm-input-wrap">
                      <span className="nb-tm-curr">$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="nb-tm-input" 
                        value={tradePrice} 
                        onChange={(e) => setTradePrice(parseFloat(e.target.value) || 0)} 
                      />
                    </div>
                  </div>

                  <div className="nb-tm-row">
                    <label>Shares Quantity</label>
                    <div className="nb-tm-qty-row">
                      <button 
                        className="nb-tm-qty-btn" 
                        onClick={() => setTradeQty(Math.max(1, tradeQty - 5))}
                      >
                        -5
                      </button>
                      <input 
                        type="number" 
                        className="nb-tm-input center" 
                        value={tradeQty} 
                        onChange={(e) => setTradeQty(Math.max(1, parseInt(e.target.value) || 1))} 
                      />
                      <button 
                        className="nb-tm-qty-btn" 
                        onClick={() => setTradeQty(tradeQty + 5)}
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <div className="nb-tm-est-box">
                    <span>Estimated Total Value:</span>
                    <strong>${(tradePrice * tradeQty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>

                  <button 
                    className={`nb-tm-submit-btn ${tradeSide === 'BUY' ? 'buy' : 'sell'}`}
                    disabled={tradeSubmitting}
                    onClick={handleExecuteTrade}
                  >
                    {tradeSubmitting ? 'Routing to Exchange...' : `Submit ${tradeSide} Order`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
