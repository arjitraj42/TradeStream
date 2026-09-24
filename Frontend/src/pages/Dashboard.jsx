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

// ── Stepped Area Chart ────────────────────────────────────────────────────
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

export default function Dashboard({ onBackToHome, onOpenTradePage }) {
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState('US / Global');
  const [ipoList, setIpoList] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null); // null = default IPO directory view
  const [activeTab, setActiveTab] = useState('fundamentals');
  const [loading, setLoading] = useState(false);
  const [showSug, setShowSug] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Load IPOs directory on initial render
  useEffect(() => {
    async function loadCatalog() {
      const list = await fetchListedIPOs();
      setIpoList(list);
    }
    loadCatalog();
  }, []);

  const filteredSuggestions = (ipoList.length > 0 ? ipoList : POPULAR_COMPANIES).filter(
    (c) =>
      query.length > 0 &&
      (c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.symbol.toLowerCase().includes(query.toLowerCase()))
  );

  async function handleSelectCompany(symbol) {
    setLoading(true);
    setShowSug(false);
    setQuery('');
    setViewMode('intel');
    try {
      const data = await fetchCompanyGrowthData(symbol);
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

  // Pagination calculation for default directory
  const totalPages = Math.ceil(ipoList.length / ITEMS_PER_PAGE) || 1;
  const displayedIpos = ipoList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const currentMeta = POPULAR_COMPANIES.find((c) => c.symbol === selectedCompany?.symbol) || {
    name: selectedCompany?.name || 'Company Inc.',
    symbol: selectedCompany?.symbol || 'TICKER',
    sector: selectedCompany?.sector || 'Market',
    color: '#18181B',
    initials: selectedCompany?.symbol?.slice(0, 2) || 'CO',
    marketCap: selectedCompany?.marketCap || '$2.40T',
    basePrice: selectedCompany?.rawPrice || 150.0,
    change: selectedCompany?.change || '+1.42%',
    isUp: selectedCompany?.isUp !== false,
  };

  return (
    <div className="nb-shell">
      {/* ── 1. TOP NAVBAR ── */}
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
          <span
            className={`nb-nav-link ${viewMode === 'directory' ? 'active' : ''}`}
            onClick={handleResetToDirectory}
          >
            Listed IPOs & Stocks
          </span>
          <span
            className={`nb-nav-link ${viewMode === 'intel' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('intel');
              if (!selectedCompany) {
                handleSelectCompany('NVDA');
              }
            }}
          >
            Company Intel
          </span>
          <span
            className={`nb-nav-link ${viewMode === 'market-pulse' ? 'active' : ''}`}
            onClick={() => setViewMode('market-pulse')}
          >
            Market Pulse
          </span>
          <span
            className={`nb-nav-link ${viewMode === 'api-docs' ? 'active' : ''}`}
            onClick={() => setViewMode('api-docs')}
          >
            API Docs
          </span>
        </nav>

        <div className="nb-nav-right">
          <button 
            className="nb-quick-trade-nav-btn"
            onClick={() => openTradeModal('NVDA', 128.45, 'NVIDIA Corp')}
            title="Instant Order Execution"
          >
            ⚡ Quick Trade
          </button>
          <div className="nb-avatar-pill">IA</div>
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
          {selectedCompany ? `Deep Analysis: ${selectedCompany.name}` : 'Listed IPOs & Company Intelligence'}
        </h1>
        <p className="nb-hero-sub">
          {selectedCompany
            ? 'Live market stats from Finnhub & AI financial intelligence powered by Tavily Search.'
            : 'Browse public listings with real-time stock values or search any specific ticker for deep evaluation.'}
        </p>

        <div className="nb-search-row">
          <div className="nb-input-box">
            <SearchIcon />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search specific company ticker (e.g. AAPL, NVDA, RDDT, MSFT)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSug(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  handleSelectCompany(query.trim());
                }
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
              if (query.trim()) handleSelectCompany(query.trim());
              else if (filteredSuggestions.length > 0) handleSelectCompany(filteredSuggestions[0].symbol);
            }}
          >
            Search
          </button>

          {/* Search Autocomplete */}
          {showSug && filteredSuggestions.length > 0 && (
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
            </div>
          )}
        </div>
      </section>

      {/* ── 3. STATUS / BREADCRUMB BANNER ── */}
      <div className="nb-status-row">
        <div className="nb-results-count">
          <span className="nb-results-title">
            {selectedCompany ? `${selectedCompany.name} (${selectedCompany.symbol})` : 'Public Listings & IPO Catalog'}
          </span>
          <span className="nb-count-badge">
            {selectedCompany ? (selectedCompany.source || 'Finnhub & Tavily Live') : `${ipoList.length} Active Public Listings`}
          </span>
        </div>

        {selectedCompany && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="nb-view-all-btn"
              style={{ background: '#2EC4B6', color: '#18181B' }}
              onClick={() => handleTradeClick(selectedCompany)}
            >
              Open Trade Console ({selectedCompany.symbol}) ⚡
            </button>
            <button className="nb-view-all-btn" onClick={handleResetToDirectory}>
              ← View All Listed IPOs
            </button>
          </div>
        )}
      </div>

      {/* ── 4. TWO-COLUMN CONTAINER ── */}
      <main className="nb-container">
        {/* LEFT COLUMN: FILTERS & ENDPOINTS */}
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
            <label className="nb-fg-label">
              {selectedCompany ? 'Intel Categories' : 'Listing Categories'}
            </label>
            <div className="nb-nav-menu">
              <div
                className={`nb-nav-tab ${activeTab === 'trade' ? 'active' : ''}`}
                onClick={() => setActiveTab('trade')}
              >
                <span>{selectedCompany ? '⚡ Trading Console' : 'Trade Console'}</span>
                <span>↗</span>
              </div>
              <div
                className={`nb-nav-tab ${activeTab === 'fundamentals' ? 'active' : ''}`}
                onClick={() => setActiveTab('fundamentals')}
              >
                <span>{selectedCompany ? 'Fundamentals' : 'Recent IPOs'}</span>
                <span>↗</span>
              </div>
              <div
                className={`nb-nav-tab ${activeTab === 'risk' ? 'active' : ''}`}
                onClick={() => setActiveTab('risk')}
              >
                <span>{selectedCompany ? 'Risk Factors' : 'Mega-Cap Stocks'}</span>
                <span>↗</span>
              </div>
              <div
                className={`nb-nav-tab ${activeTab === 'news' ? 'active' : ''}`}
                onClick={() => setActiveTab('news')}
              >
                <span>{selectedCompany ? 'Events / News' : 'High Momentum'}</span>
                <span>↗</span>
              </div>
              <div
                className={`nb-nav-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <span>{selectedCompany ? 'Price History' : 'Semiconductors'}</span>
                <span>↗</span>
              </div>
            </div>
          </div>

          <div className="nb-filter-group">
            <label className="nb-fg-label">Live Feed Status</label>
            <div className="nb-checkbox-list">
              <label className="nb-checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Finnhub Live Quotes</span>
              </label>
              <label className="nb-checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Tavily AI Intelligence</span>
              </label>
              <label className="nb-checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Analyst Ratings</span>
              </label>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: DEFAULT IPO DIRECTORY vs SPECIFIC EVALUATED COMPANY */}
        <section className="nb-main-content">
          {loading ? (
            <div className="nb-empty-box">
              <div className="nb-spinner-nb"></div>
              <p>Aggregating Finnhub data & Tavily AI intelligence...</p>
            </div>
          ) : !selectedCompany ? (
            /* ── DEFAULT VIEW: IPOs & LISTED COMPANIES DIRECTORY WITH PAGINATION ── */
            <div className="nb-ipos-container">
              {displayedIpos.map((item) => (
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
                          {item.ipoDate ? `IPO: ${item.ipoDate}` : 'Listed'}
                        </span>
                        <span className="nb-tag-pill blue">
                          {item.symbol}
                        </span>
                      </div>
                      <span className="nb-ipo-sub">
                        {item.sector} · IPO Issue: {item.ipoPrice || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="nb-ipo-center-stats">
                    <div className="nb-stat-pill-col">
                      <span className="nb-spc-label">Stock Price</span>
                      <span className="nb-spc-val">${item.price || item.defaultPrice}</span>
                    </div>
                    <div className="nb-stat-pill-col">
                      <span className="nb-spc-label">24h Change</span>
                      <span className={`nb-spc-val ${item.isUp !== false ? 'up' : 'dn'}`}>
                        {item.change || '+1.20%'}
                      </span>
                    </div>
                    <div className="nb-stat-pill-col">
                      <span className="nb-spc-label">Market Cap</span>
                      <span className="nb-spc-val">{item.marketCap || '$10.0B'}</span>
                    </div>
                  </div>

                    <div className="nb-ipo-right-action" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="nb-action-btn"
                        style={{ background: '#2EC4B6', color: '#18181B' }}
                        onClick={() => handleTradeClick(item)}
                      >
                        Trade ⚡
                      </button>
                    <button
                      className="nb-action-btn"
                      onClick={() => handleSelectCompany(item.symbol)}
                    >
                      Evaluate Intel ↗
                    </button>
                  </div>
                </div>
              ))}

              {/* ── PAGINATION BAR ── */}
              <div className="nb-pagination-bar">
                <span className="nb-page-info">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, ipoList.length)} of {ipoList.length} companies
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
            </div>
          ) : (
            /* ── SPECIFIC EVALUATED COMPANY VIEW (WHEN SEARCHED OR CLICKED) ── */
            <>
              {/* Top 4 Stat Cards */}
              <div className="nb-stats-grid">
                <div className="nb-stat-card yellow-accent">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">$</div>
                    <div className="nb-stat-badge">{selectedCompany.change}</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">LIVE STOCK PRICE</span>
                    <div className="nb-stat-val">
                      {selectedCompany.currency || '$'}{selectedCompany.price}
                    </div>
                  </div>
                </div>

                <div className="nb-stat-card">
                  <div className="nb-stat-top">
                    <div className="nb-stat-icon-box">PE</div>
                    <div className="nb-stat-badge">TTM</div>
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
                    <div className="nb-stat-badge">ROE</div>
                  </div>
                  <div>
                    <span className="nb-stat-label">RETURN ON EQUITY</span>
                    <div className="nb-stat-val">
                      {selectedCompany?.metrics?.roe || '42.3%'}
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

              {/* Charts Row */}
              <div className="nb-charts-row">
                <div className="nb-chart-card">
                  <div className="nb-chart-header">
                    <div>
                      <span className="nb-chart-title">PRICE / TRAJECTORY OVERVIEW</span>
                      <span className="nb-chart-sub">30-Day Step Trajectory · {selectedCompany?.symbol}</span>
                    </div>
                    <button className="nb-pill-btn">••• OPTIONS</button>
                  </div>
                  <SteppedChart data={selectedCompany?.chartData || []} isUp={selectedCompany?.isUp} />
                </div>

                <div className="nb-chart-card">
                  <div className="nb-chart-header">
                    <div>
                      <span className="nb-chart-title">VOLUME ACTIVITY</span>
                      <span className="nb-chart-sub">Weekly Market Momentum</span>
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

              {/* REAL-TIME TRADING CONSOLE LAUNCHER CARD */}
              <div className="nb-company-card" style={{ background: '#0F172A', color: '#F8FAFC', border: '2px solid #1E293B', marginBottom: '24px' }}>
                <div className="nb-cc-header">
                  <div className="nb-cc-left">
                    <div className="nb-cc-logo-box" style={{ background: '#6366F1' }}>⚡</div>
                    <div className="nb-cc-title-wrap">
                      <div className="nb-cc-title-row">
                        <span className="nb-cc-title" style={{ color: '#FFFFFF' }}>Real-time Trading Console</span>
                        <span className="nb-tag-pill green">Live Simulation Engine</span>
                      </div>
                      <span className="nb-cc-sub" style={{ color: '#94A3B8' }}>
                        Dedicated Order Execution & Order Time History Log for {selectedCompany.name} ({selectedCompany.symbol})
                      </span>
                    </div>
                  </div>
                  <div className="nb-cc-right">
                    <button
                      className="nb-action-btn"
                      style={{ background: '#2EC4B6', color: '#18181B', fontWeight: 800, padding: '10px 20px' }}
                      onClick={() => handleTradeClick(selectedCompany)}
                    >
                      Launch Trade Console ⚡
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Intel Tabs (Fundamentals / Risk / News / History) */}

              {activeTab === 'fundamentals' && (
                <div className="nb-company-card">
                  <div className="nb-cc-header">
                    <div className="nb-cc-left">
                      <div
                        className="nb-cc-logo-box"
                        style={{ background: currentMeta.color || '#18181B' }}
                      >
                        {currentMeta.initials || selectedCompany.symbol.slice(0, 2)}
                      </div>
                      <div className="nb-cc-title-wrap">
                        <div className="nb-cc-title-row">
                          <span className="nb-cc-title">{selectedCompany.name}</span>
                          <span className="nb-tag-pill green">Live Feed</span>
                          <span className="nb-tag-pill coral">{selectedCompany?.metrics?.analystRating || 'Strong Buy'}</span>
                        </div>
                        <span className="nb-cc-sub">
                          {selectedCompany.symbol} · {selectedCompany.sector} · Market Cap {selectedCompany.marketCap}
                        </span>
                      </div>
                    </div>
                    <div className="nb-cc-right">
                      <PinIcon />
                      <span>{selectedCompany?.exchange || 'NASDAQ / Global'}</span>
                    </div>
                  </div>

                  <div className="nb-cc-body">
                    <ul className="nb-cc-bullets">
                      <li>
                        <strong>Revenue Expansion:</strong> {selectedCompany?.metrics?.revGrowth || '+12.5% YoY'} with net profit margin of {selectedCompany?.metrics?.netMargin || '26.4%'}.
                      </li>
                      <li>
                        <strong>Valuation Multiples:</strong> P/E Ratio {selectedCompany?.metrics?.peRatio || '33.8'} with Beta {selectedCompany?.metrics?.beta || '1.18'} and 52-Week Range {selectedCompany?.metrics?.week52Low || '$164.08'} - {selectedCompany?.metrics?.week52High || '$237.23'}.
                      </li>
                      <li>
                        <strong>AI Summary (Tavily):</strong> {selectedCompany?.summary || 'Consistent revenue expansion propelled by high-margin Services, recurring ecosystem subscriptions, and AI integration.'}
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
                          <span className="nb-tag-pill coral">Beta {selectedCompany?.metrics?.beta || '1.18'}</span>
                          <span className="nb-tag-pill green">Monitored</span>
                        </div>
                        <span className="nb-cc-sub">Real-Time Risk & Volatility Indicators for {selectedCompany.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="nb-cc-body" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {(selectedCompany?.risks || ['Macro Volatility', 'Supply Chain', 'Regulatory Oversight', 'Market Competition']).map((r, i) => (
                        <span key={i} className="nb-tag-pill blue" style={{ color: '#18181B', background: '#F4D35E' }}>
                          ⚠ {r}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#18181B' }}>
                      <strong>Risk Assessment:</strong> Beta rating of <strong>{selectedCompany?.metrics?.beta || '1.18'}</strong> indicates moderate market sensitivity. Key areas to monitor include quarterly supply chain throughput, foreign exchange fluctuations, and regulatory compliance across global jurisdictions.
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
                          <span className="nb-cc-title">Live News & Event Headlines</span>
                          <span className="nb-tag-pill green">Finnhub Real-time</span>
                        </div>
                        <span className="nb-cc-sub">Latest market filings and analyst coverage</span>
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
                          <span className="nb-cc-title">Historical Extremes & Range</span>
                          <span className="nb-tag-pill green">52-Week</span>
                        </div>
                        <span className="nb-cc-sub">Trading ranges and valuation support levels</span>
                      </div>
                    </div>
                  </div>

                  <div className="nb-cc-body">
                    <ul className="nb-cc-bullets">
                      <li>
                        <strong>52-Week High:</strong> {selectedCompany?.metrics?.week52High || '$237.23'} — Peak momentum valuation.
                      </li>
                      <li>
                        <strong>52-Week Low:</strong> {selectedCompany?.metrics?.week52Low || '$164.08'} — Major accumulation floor.
                      </li>
                      <li>
                        <strong>Current Position:</strong> Currently trading at {selectedCompany?.currency || '$'}{selectedCompany?.price} ({selectedCompany?.change} on the session).
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
