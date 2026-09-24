import React, { useState, useEffect, useRef } from 'react';
import {
  POPULAR_COMPANIES,
  COMPANY_FUNDAMENTALS,
  fetchCompanyGrowthData,
} from '../features/company/companyService';
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

// ── Neo-Brutalist Stepped Area Chart (Matching Image 1) ────────────────────
function SteppedChart({ data = [], isUp = true }) {
  if (!data || data.length === 0) return null;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 520;
  const H = 150;
  const pad = 12;

  let stepPath = '';
  let fillPath = '';

  data.forEach((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.value - min) / range) * (H - pad * 2);

    if (i === 0) {
      stepPath += `M ${x},${y}`;
      fillPath += `M ${x},${H - pad} L ${x},${y}`;
    } else {
      stepPath += ` L ${x},${y}`;
      fillPath += ` L ${x},${y}`;
    }
  });

  fillPath += ` L ${W - pad},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="nb-step-svg">
      <line x1={pad} y1={pad + 20} x2={W - pad} y2={pad + 20} stroke="#E4E4E7" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#E4E4E7" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1={pad} y1={H - pad - 20} x2={W - pad} y2={H - pad - 20} stroke="#E4E4E7" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#18181B" strokeWidth="2" />

      <path d={fillPath} fill="#F28482" opacity="0.85" />
      <path d={stepPath} fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="miter" strokeLinecap="square" />
    </svg>
  );
}

export default function Dashboard({ onBackToHome, initialSymbol = 'AAPL' }) {
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState('US / Global');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('fundamentals');
  const [loading, setLoading] = useState(false);
  const [showSug, setShowSug] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    loadCompany(initialSymbol || 'AAPL');
  }, [initialSymbol]);

  const filtered = POPULAR_COMPANIES.filter(
    (c) =>
      query.length > 0 &&
      (c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.symbol.toLowerCase().includes(query.toLowerCase()))
  );

  async function loadCompany(symbol) {
    setLoading(true);
    setShowSug(false);
    setQuery('');
    try {
      const data = await fetchCompanyGrowthData(symbol, '1M');
      setSelectedCompany(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const currentMeta = POPULAR_COMPANIES.find((c) => c.symbol === selectedCompany?.symbol) || {
    name: selectedCompany?.name || 'Apple Inc.',
    symbol: selectedCompany?.symbol || 'AAPL',
    sector: selectedCompany?.sector || 'Technology',
    color: '#18181B',
    initials: 'AP',
    marketCap: '$3.42T',
    basePrice: 228.87,
    change: '+1.42%',
    isUp: true,
  };

  return (
    <div className="nb-shell">
      {/* ── 1. NEO-BRUTALIST TOP NAVBAR ── */}
      <header className="nb-navbar">
        <div className="nb-nav-left">
          <div className="nb-logo" onClick={onBackToHome}>
            <span className="nb-logo-badge">IA</span>
            <span>Invest Agent</span>
          </div>
          <button className="nb-back-btn" onClick={onBackToHome}>
            ← Back to Home
          </button>
        </div>

        <nav className="nb-nav-links">
          <span className="nb-nav-link active">Company Intel</span>
          <span className="nb-nav-link">Market Screener</span>
          <span className="nb-nav-link">Risk Analysis</span>
          <span className="nb-nav-link">API Docs</span>
        </nav>

        <div className="nb-nav-right">
          <div className="nb-avatar-pill">IA</div>
        </div>
      </header>

      {/* ── 2. HERO SEARCH CLUSTER (IMAGE 2 STYLE) ── */}
      <section className="nb-hero">
        <h1 className="nb-hero-title">Evaluate Any Company</h1>
        <p className="nb-hero-sub">
          Search real-time financial stats, fundamentals, and automated growth performance reports.
        </p>

        <div className="nb-search-row">
          <div className="nb-input-box">
            <SearchIcon />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search company ticker (e.g. AAPL, NVDA, TSLA)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSug(true);
              }}
              onFocus={() => query && setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 200)}
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
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              placeholder="Exchange / Market"
            />
          </div>

          <button
            className="nb-search-btn"
            onClick={() => {
              if (filtered.length > 0) loadCompany(filtered[0].symbol);
            }}
          >
            Search
          </button>

          {showSug && filtered.length > 0 && (
            <div className="nb-search-suggestions">
              {filtered.map((c) => (
                <div
                  key={c.symbol}
                  className="nb-sug-item"
                  onMouseDown={() => loadCompany(c.symbol)}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      background: c.color,
                      border: '1.5px solid #18181B',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 11,
                    }}
                  >
                    {c.initials}
                  </div>
                  <div className="nb-sug-info">
                    <span className="nb-sug-name">{c.name}</span>
                    <span className="nb-sug-sym">{c.symbol} · {c.sector}</span>
                  </div>
                  <span className={`nb-sug-chg ${c.isUp ? 'up' : 'dn'}`}>
                    {c.change}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 3. TRACKED RESULTS BANNER ── */}
      <div className="nb-status-row">
        <div className="nb-results-count">
          <span className="nb-results-title">Company Intelligence</span>
          <span className="nb-count-badge">Backend Ready Engine</span>
        </div>
      </div>

      {/* ── 4. TWO-COLUMN CONTAINER ── */}
      <main className="nb-container">
        {/* LEFT COLUMN: FILTERS & BACKEND ENDPOINTS */}
        <aside className="nb-filter-card">
          <div className="nb-filter-head">
            <span className="nb-filter-title">Filters & APIs</span>
            <ChevronDown />
          </div>

          <div className="nb-filter-group">
            <label className="nb-fg-label">Data Range</label>
            <select className="nb-select-box" defaultValue="1Month">
              <option value="1Day">Last 24 Hours</option>
              <option value="1Week">Last Week</option>
              <option value="1Month">Last 1 Month</option>
              <option value="1Year">Last 1 Year</option>
            </select>
          </div>

          <div className="nb-filter-group">
            <label className="nb-fg-label">Intel Categories</label>
            <div className="nb-nav-menu">
              <div
                className={`nb-nav-tab ${activeTab === 'fundamentals' ? 'active' : ''}`}
                onClick={() => setActiveTab('fundamentals')}
              >
                <span>Fundamentals</span>
                <span>↗</span>
              </div>
              <div
                className={`nb-nav-tab ${activeTab === 'risk' ? 'active' : ''}`}
                onClick={() => setActiveTab('risk')}
              >
                <span>Risk Factors</span>
                <span>↗</span>
              </div>
              <div
                className={`nb-nav-tab ${activeTab === 'news' ? 'active' : ''}`}
                onClick={() => setActiveTab('news')}
              >
                <span>Events / News</span>
                <span>↗</span>
              </div>
              <div
                className={`nb-nav-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <span>Price History</span>
                <span>↗</span>
              </div>
            </div>
          </div>

          <div className="nb-filter-group">
            <label className="nb-fg-label">Backend Feed Mode</label>
            <div className="nb-checkbox-list">
              <label className="nb-checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Live REST Stream</span>
              </label>
              <label className="nb-checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Fundamental Ratios</span>
              </label>
              <label className="nb-checkbox-item">
                <input type="checkbox" />
                <span>Analyst Consensus</span>
              </label>
              <label className="nb-checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Risk Scored (Beta)</span>
              </label>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: METRICS, CHARTS, AND PERFORMANCE REPORT */}
        <section className="nb-main-content">
          {loading ? (
            <div className="nb-empty-box">
              <div className="nb-spinner-nb"></div>
              <p>Fetching company intelligence & performance metrics...</p>
            </div>
          ) : (
            <>
              {/* ── 4 STAT CARDS (IMAGE 1 STYLE) ── */}
              <div className="nb-stats-grid">
                <div className="nb-stat-card yellow-accent">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">$</div>
                    <div className="nb-stat-badge">↗ 12.5%</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">TOTAL VALUATION</span>
                    <div className="nb-stat-val">
                      {selectedCompany ? selectedCompany.currency + selectedCompany.price : '$42,500'}
                    </div>
                  </div>
                </div>

                <div className="nb-stat-card">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">PE</div>
                    <div className="nb-stat-badge">↗ 8.2%</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">P/E RATIO</span>
                    <div className="nb-stat-val">
                      {selectedCompany?.metrics?.peRatio || '33.8'}
                    </div>
                  </div>
                </div>

                <div className="nb-stat-card">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">%</div>
                    <div className="nb-stat-badge">42.3%</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">RETURN ON EQUITY</span>
                    <div className="nb-stat-val">
                      {selectedCompany?.metrics?.roe || '147.2%'}
                    </div>
                  </div>
                </div>

                <div className="nb-stat-card">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">★</div>
                    <div className="nb-stat-badge">99.9%</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">GROWTH SCORE</span>
                    <div className="nb-stat-val">
                      {selectedCompany?.growthScore ? `${selectedCompany.growthScore}/100` : '91/100'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2 CHARTS ROW (IMAGE 1 STYLE) ── */}
              <div className="nb-charts-row">
                <div className="nb-chart-card">
                  <div className="nb-chart-header">
                    <div>
                      <span className="nb-chart-title">PRICE / REVENUE OVERVIEW</span>
                      <span className="nb-chart-sub">Monthly Trajectory · 30-Day Step Trajectory</span>
                    </div>
                    <button className="nb-pill-btn">••• OPTIONS</button>
                  </div>
                  <SteppedChart data={selectedCompany?.chartData || []} isUp={selectedCompany?.isUp} />
                </div>

                <div className="nb-chart-card">
                  <div className="nb-chart-header">
                    <div>
                      <span className="nb-chart-title">VOLUME ACTIVITY</span>
                      <span className="nb-chart-sub">Weekly Frequency</span>
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

              {/* ── PERFORMANCE REPORT DUMMY CARDS ── */}
              <div className="nb-company-card">
                <div className="nb-cc-header">
                  <div className="nb-cc-left">
                    <div
                      className="nb-cc-logo-box"
                      style={{ background: currentMeta.color || '#18181B' }}
                    >
                      {currentMeta.initials || 'CO'}
                    </div>
                    <div className="nb-cc-title-wrap">
                      <div className="nb-cc-title-row">
                        <span className="nb-cc-title">{selectedCompany?.name || 'Apple Inc.'}</span>
                        <span className="nb-tag-pill green">Full-time Live</span>
                        <span className="nb-tag-pill coral">{selectedCompany?.metrics?.analystRating || 'Strong Buy'}</span>
                      </div>
                      <span className="nb-cc-sub">
                        {selectedCompany?.symbol || 'AAPL'} · {selectedCompany?.sector || 'Consumer Electronics'}
                      </span>
                    </div>
                  </div>
                  <div className="nb-cc-right">
                    <PinIcon />
                    <span>Global Exchange</span>
                  </div>
                </div>

                <div className="nb-cc-body">
                  <ul className="nb-cc-bullets">
                    <li>
                      <strong>Revenue Expansion:</strong> {selectedCompany?.metrics?.revGrowth || '+8.2% YoY'} consistent annual expansion with net profit margin of {selectedCompany?.metrics?.netMargin || '26.4%'}.
                    </li>
                    <li>
                      <strong>Cash Flow Reserves:</strong> Generating {selectedCompany?.metrics?.freeCashFlow || '$108B'} in unlevered free cash flow with prudent debt ratio of {selectedCompany?.metrics?.debtToEquity || '1.45'}.
                    </li>
                    <li>
                      <strong>Executive Summary:</strong> {selectedCompany?.summary || 'Consistent revenue expansion propelled by high-margin Services, recurring ecosystem subscriptions, and AI integration.'}
                    </li>
                  </ul>
                  <button className="nb-action-btn">
                    Export Report
                  </button>
                </div>
              </div>

              <div className="nb-company-card">
                <div className="nb-cc-header">
                  <div className="nb-cc-left">
                    <div className="nb-cc-logo-box" style={{ background: '#0078D4' }}>
                      MS
                    </div>
                    <div className="nb-cc-title-wrap">
                      <div className="nb-cc-title-row">
                        <span className="nb-cc-title">Cloud & AI Division Health</span>
                        <span className="nb-tag-pill blue">Enterprise</span>
                        <span className="nb-tag-pill green">Low Risk</span>
                      </div>
                      <span className="nb-cc-sub">Microsoft Copilot & Azure Cloud Metrics</span>
                    </div>
                  </div>
                  <div className="nb-cc-right">
                    <PinIcon />
                    <span>Redmond, WA, USA</span>
                  </div>
                </div>

                <div className="nb-cc-body">
                  <ul className="nb-cc-bullets">
                    <li>
                      <strong>Quarterly Cloud Growth:</strong> Over +29% YoY expansion in enterprise infrastructure demand.
                    </li>
                    <li>
                      <strong>Operating Efficiency:</strong> 36.1% net profit margin driven by scalable recurring enterprise software seats.
                    </li>
                  </ul>
                  <button className="nb-action-btn">
                    Apply Intel
                  </button>
                </div>
              </div>

              <div className="nb-company-card">
                <div className="nb-cc-header">
                  <div className="nb-cc-left">
                    <div className="nb-cc-logo-box" style={{ background: '#76B900' }}>
                      NV
                    </div>
                    <div className="nb-cc-title-wrap">
                      <div className="nb-cc-title-row">
                        <span className="nb-cc-title">Semiconductor & Accelerator Demand</span>
                        <span className="nb-tag-pill coral">High Volatility</span>
                        <span className="nb-tag-pill green">Triple Digit Growth</span>
                      </div>
                      <span className="nb-cc-sub">Data Center GPU Allocations</span>
                    </div>
                  </div>
                  <div className="nb-cc-right">
                    <PinIcon />
                    <span>Santa Clara, CA, USA</span>
                  </div>
                </div>

                <div className="nb-cc-body">
                  <ul className="nb-cc-bullets">
                    <li>
                      <strong>Triple Digit Surge:</strong> +122% YoY revenue growth driven by Blackwell and H100 computing architectures.
                    </li>
                    <li>
                      <strong>Margin Expansion:</strong> Gross margins reaching 55.3% with top-tier ROE exceeding 115%.
                    </li>
                  </ul>
                  <button className="nb-action-btn">
                    Apply Intel
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
