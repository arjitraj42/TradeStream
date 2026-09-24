import React, { useState, useEffect, useMemo } from 'react';
import { fetchMarketPulseData } from '../features/company/companyService';
import './MarketPulse.css';

export default function MarketPulse({ onSelectCompany, onQuickTrade }) {
  const [pulseData, setPulseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCompanySymbol, setSelectedCompanySymbol] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [isStreaming, setIsStreaming] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('14:32:08 EST');
  const [notification, setNotification] = useState(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertKeyword, setAlertKeyword] = useState('Blackwell');

  // Load pulse data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchMarketPulseData();
      setPulseData(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Realtime clock simulator
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' EST';
      setLastSyncTime(timeStr);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportFeed = () => {
    if (!pulseData?.news) return;
    const exportText = pulseData.news
      .map(
        (n) =>
          `[${n.symbol}] ${n.topicTag} | ${n.headline}\nSource: ${n.source} (${n.timeAgo})\nSummary: ${n.summary}\n---`
      )
      .join('\n\n');
    navigator.clipboard?.writeText(exportText);
    showToast('Market Pulse news feed copied to clipboard!');
  };

  // Filter and sort news
  const filteredNews = useMemo(() => {
    if (!pulseData?.news) return [];
    let list = [...pulseData.news];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((n) => n.category === selectedCategory);
    }

    // Company symbol filter
    if (selectedCompanySymbol !== 'ALL') {
      list = list.filter(
        (n) => n.symbol.toUpperCase() === selectedCompanySymbol.toUpperCase()
      );
    }

    // Sentiment filter
    if (sentimentFilter !== 'ALL') {
      list = list.filter((n) => {
        if (sentimentFilter === 'BULL') return n.sentiment === 'bullish';
        if (sentimentFilter === 'NEUT') return n.sentiment === 'neutral';
        if (sentimentFilter === 'BEAR') return n.sentiment === 'bearish';
        return true;
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.headline.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.symbol.toLowerCase().includes(q) ||
          n.companyName.toLowerCase().includes(q) ||
          n.topicTag.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'impact') {
      list.sort((a, b) => (b.impact || '').localeCompare(a.impact || ''));
    } else if (sortBy === 'bullish') {
      list.sort((a, b) => (a.sentiment === 'bullish' ? -1 : 1));
    }

    return list;
  }, [pulseData, selectedCategory, selectedCompanySymbol, sentimentFilter, searchQuery, sortBy]);

  const companyList = [
    { symbol: 'ALL', name: 'All Companies', badge: 'ALL' },
    { symbol: 'NVDA', name: 'Nvidia', badge: 'NV', color: '#76B900' },
    { symbol: 'AAPL', name: 'Apple', badge: 'AP', color: '#18181B' },
    { symbol: 'MSFT', name: 'Microsoft', badge: 'MS', color: '#0078D4' },
    { symbol: 'RDDT', name: 'Reddit', badge: 'RD', color: '#FF4500' },
    { symbol: 'TSLA', name: 'Tesla', badge: 'TS', color: '#CC0000' },
    { symbol: 'ARM', name: 'Arm Holdings', badge: 'AR', color: '#0091BD' },
    { symbol: 'AMZN', name: 'Amazon', badge: 'AM', color: '#FF9900' },
    { symbol: 'ALAB', name: 'Astera Labs', badge: 'AL', color: '#10B981' },
  ];

  return (
    <div className="mp-root">
      {/* Toast Notification */}
      {notification && (
        <div className="mp-toast animate-slide-in">
          <span className="mp-toast-icon">✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* ── 1. TOP LIVE TICKER TAPE (Sticky Institutional Bar) ── */}
      <section className="mp-ticker-tape-container">
        <div className="mp-ticker-tape">
          <div className="mp-session-badge">
            <span className="mp-pulse-dot emerald"></span>
            <span className="mp-session-text">MARKET OPEN · REAL-TIME FEED</span>
          </div>

          <div className="mp-ticker-items">
            {(pulseData?.tickerTape || []).map((ticker) => (
              <div
                key={ticker.symbol}
                className={`mp-ticker-item ${selectedCompanySymbol === ticker.symbol ? 'selected' : ''}`}
                onClick={() => setSelectedCompanySymbol(ticker.symbol)}
                title={`Filter news for ${ticker.symbol}`}
              >
                <span className="mp-ticker-sym">{ticker.symbol}</span>
                <span className="mp-ticker-price">{ticker.price}</span>
                <span className={`mp-ticker-delta ${ticker.isUp ? 'up' : 'down'}`}>
                  <span className={`mp-ticker-dot ${ticker.isUp ? 'up' : 'down'}`}></span>
                  {ticker.change}
                </span>
              </div>
            ))}
          </div>

          <div className="mp-latency-badge">
            <span className="mp-wifi-icon">⚡</span>
            <span>LATENCY: <strong>14ms</strong></span>
          </div>
        </div>
      </section>

      <div className="mp-content-wrapper">
        {/* ── 2. SCREEN TITLE & CONTROLS HEADER ── */}
        <section className="mp-header-card">
          <div className="mp-header-left">
            <div className="mp-title-row">
              <h1 className="mp-main-title">
                Market Pulse: Realtime Intelligence &amp; News Feed
              </h1>
              <span className={`mp-live-badge ${isStreaming ? 'streaming' : 'paused'}`}>
                <span className="mp-pulse-dot"></span>
                {isStreaming ? '● LIVE FEED' : 'STREAM PAUSED'}
              </span>
            </div>
            <div className="mp-meta-row">
              <span className="mp-meta-item">
                <span className="mp-meta-icon">↻</span>
                Auto-Refresh: <strong>{isStreaming ? 'ON (3s)' : 'OFF'}</strong>
              </span>
              <span className="mp-sep">|</span>
              <span className="mp-meta-item">
                Last Sync: <strong className="mp-mono">{lastSyncTime}</strong>
              </span>
              <span className="mp-sep">|</span>
              <span className="mp-meta-item">
                Velocity: <strong className="mp-mono">42 updates/min</strong>
              </span>
            </div>
          </div>

          <div className="mp-header-actions">
            <button
              className={`mp-btn-secondary ${!isStreaming ? 'mp-btn-active' : ''}`}
              onClick={() => {
                setIsStreaming(!isStreaming);
                showToast(isStreaming ? 'Feed streaming paused.' : 'Feed streaming resumed.');
              }}
            >
              <span>{isStreaming ? '⏸ Pause Stream' : '▶ Resume Stream'}</span>
            </button>
            <button className="mp-btn-secondary" onClick={handleExportFeed}>
              <span>📥 Export Feed</span>
            </button>
            <button
              className="mp-btn-primary"
              onClick={() => setAlertModalOpen(true)}
            >
              <span>⚙ Configure Alerts</span>
            </button>
          </div>
        </section>

        {/* ── 3. FILTER & CATEGORIZATION TOOLBAR ── */}
        <section className="mp-filter-card">
          {/* Category Tabs */}
          <div className="mp-category-tabs">
            {[
              { id: 'all', label: 'All News' },
              { id: 'growth', label: 'Growth & Expansion' },
              { id: 'stock', label: 'Stock & Earnings' },
              { id: 'ratings', label: 'Analyst Ratings' },
              { id: 'macro', label: 'Macro & Industry' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`mp-cat-tab ${selectedCategory === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Company Selector Chips */}
          <div className="mp-company-chips">
            {companyList.map((c) => (
              <button
                key={c.symbol}
                className={`mp-chip ${selectedCompanySymbol === c.symbol ? 'active' : ''}`}
                onClick={() => setSelectedCompanySymbol(c.symbol)}
              >
                {c.symbol !== 'ALL' && (
                  <span
                    className="mp-chip-avatar"
                    style={{ backgroundColor: c.color || '#18181B' }}
                  >
                    {c.badge}
                  </span>
                )}
                <span>{c.symbol === 'ALL' ? '✓ All Companies' : `${c.symbol} (${c.name})`}</span>
              </button>
            ))}
          </div>

          {/* Controls Row: Search + Sort + Sentiment Toggles */}
          <div className="mp-controls-grid">
            <div className="mp-search-col">
              <span className="mp-search-icon">🔍</span>
              <input
                type="text"
                className="mp-search-input"
                placeholder="Filter news by keyword or ticker (e.g. Blackwell, Capex, RDDT, ARM)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="mp-clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
              <span className="mp-shortcut-kbd">⌘K</span>
            </div>

            <div className="mp-sort-col">
              <select
                className="mp-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Sort: Most Recent</option>
                <option value="impact">Sort: Highest Impact</option>
                <option value="bullish">Sort: Bullish First</option>
              </select>
            </div>

            <div className="mp-sentiment-col">
              {['ALL', 'BULL', 'NEUT', 'BEAR'].map((s) => (
                <button
                  key={s}
                  className={`mp-sent-btn ${sentimentFilter === s ? 'active' : ''} ${s.toLowerCase()}`}
                  onClick={() => setSentimentFilter(s)}
                >
                  {s === 'ALL' ? 'All' : s === 'BULL' ? 'Bull' : s === 'NEUT' ? 'Neut' : 'Bear'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. MAIN GRID LAYOUT: Left 2/3 Feed & Right 1/3 Analytics Sidebar ── */}
        <div className="mp-main-grid">
          {/* ── LEFT 2/3: LIVE COMPANY NEWS STREAM CARDS ── */}
          <div className="mp-feed-column">
            {loading ? (
              <div className="mp-loading-card">
                <div className="mp-spinner"></div>
                <p>Connecting to live company news stream...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="mp-empty-card">
                <p className="mp-empty-title">No news matches your current filters</p>
                <p className="mp-empty-sub">
                  Try clearing your search query or switching company/category filters.
                </p>
                <button
                  className="mp-btn-primary"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedCompanySymbol('ALL');
                    setSentimentFilter('ALL');
                    setSearchQuery('');
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredNews.map((item) => (
                <article key={item.id} className="mp-news-card">
                  {/* Card Header */}
                  <div className="mp-card-top">
                    <div className="mp-card-company">
                      <span className="mp-ticker-pill">{item.symbol}</span>
                      <span className="mp-card-name">{item.companyName}</span>
                      <span className="mp-card-sector">({item.sector})</span>
                    </div>

                    <div className="mp-card-topic-meta">
                      <span className={`mp-topic-tag ${item.category}`}>
                        {item.topicTag}
                      </span>
                      <span className="mp-time-ago">{item.timeAgo}</span>
                    </div>
                  </div>

                  {/* Card Source & Impact */}
                  <div className="mp-card-source-bar">
                    <span className="mp-source-tag">
                      <span className="mp-verified-check">✓</span>
                      {item.source}
                    </span>
                    <span className="mp-source-sep">•</span>
                    <span
                      className={`mp-impact-tag ${
                        item.sentiment === 'bullish'
                          ? 'bullish'
                          : item.sentiment === 'bearish'
                          ? 'bearish'
                          : 'neutral'
                      }`}
                    >
                      Impact: {item.impact}
                    </span>
                  </div>

                  {/* Headline & Body */}
                  <h2 className="mp-headline">{item.headline}</h2>
                  <p className="mp-summary">{item.summary}</p>

                  {/* Key Metrics Pill Highlight */}
                  {item.keyMetrics && item.keyMetrics.length > 0 && (
                    <div className="mp-metrics-highlight">
                      <span className="mp-metrics-icon">📈</span>
                      {item.keyMetrics.map((km, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <span className="mp-metrics-dot">•</span>}
                          <span className="mp-metric-val">
                            <strong>{km.label}:</strong> {km.value}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mp-card-actions">
                    <div className="mp-action-left">
                      <button
                        className="mp-btn-action-primary"
                        onClick={() => {
                          if (onSelectCompany) {
                            onSelectCompany(item.symbol);
                          }
                        }}
                        title={`View deep financial intelligence for ${item.symbol}`}
                      >
                        View Company Intel
                      </button>
                      <button
                        className="mp-btn-action-trade"
                        onClick={() => {
                          if (onQuickTrade) {
                            onQuickTrade(item.symbol);
                          }
                        }}
                        title={`Quick Trade ${item.symbol}`}
                      >
                        ⚡ Quick Trade ({item.symbol})
                      </button>
                    </div>

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mp-source-link"
                      >
                        <span>Source Link</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>

          {/* ── RIGHT 1/3: MARKET SENTIMENT & GROWTH SIDEBAR ── */}
          <aside className="mp-sidebar-column">
            {/* WIDGET A: Realtime Market Sentiment Index */}
            <div className="mp-side-card">
              <div className="mp-side-header">
                <div className="mp-side-title-group">
                  <span className="mp-side-icon">⏱</span>
                  <h3 className="mp-side-title">Market Sentiment Index</h3>
                </div>
                <span className="mp-side-badge green">LIVE</span>
              </div>

              <div className="mp-sentiment-body">
                <div className="mp-sent-score-row">
                  <div>
                    <div className="mp-sent-score">
                      {pulseData?.marketSentiment?.score || 76}
                      <span className="mp-sent-score-max">/100</span>
                    </div>
                    <p className="mp-sent-label">
                      {pulseData?.marketSentiment?.label || 'Greed / Bullish Growth'}
                    </p>
                  </div>
                  <div className="mp-sent-delta-box">
                    <span className="mp-sent-delta">
                      {pulseData?.marketSentiment?.delta || '+4 pts'}
                    </span>
                    <span className="mp-sent-delta-sub">vs yesterday</span>
                  </div>
                </div>

                {/* Segmented Bar Meter */}
                <div className="mp-sent-meter-wrap">
                  <div className="mp-sent-meter-track">
                    <div
                      className="mp-meter-segment green"
                      style={{ width: `${pulseData?.marketSentiment?.bullishPct || 64}%` }}
                    ></div>
                    <div
                      className="mp-meter-segment gray"
                      style={{ width: `${pulseData?.marketSentiment?.neutralPct || 22}%` }}
                    ></div>
                    <div
                      className="mp-meter-segment red"
                      style={{ width: `${pulseData?.marketSentiment?.bearishPct || 14}%` }}
                    ></div>
                  </div>
                  <div className="mp-sent-meter-labels">
                    <span className="txt-green">
                      Bullish {pulseData?.marketSentiment?.bullishPct || 64}%
                    </span>
                    <span className="txt-gray">
                      Neutral {pulseData?.marketSentiment?.neutralPct || 22}%
                    </span>
                    <span className="txt-red">
                      Bearish {pulseData?.marketSentiment?.bearishPct || 14}%
                    </span>
                  </div>
                </div>

                <div className="mp-sent-commentary">
                  {pulseData?.marketSentiment?.commentary ||
                    'Momentum indicates high capital rotation into large-cap semiconductor infrastructure and enterprise monetization vectors.'}
                </div>
              </div>
            </div>

            {/* WIDGET B: Top Growth Stories of the Day */}
            <div className="mp-side-card">
              <div className="mp-side-header">
                <div className="mp-side-title-group">
                  <span className="mp-side-icon">📈</span>
                  <h3 className="mp-side-title">Top Growth Stories</h3>
                </div>
                <span className="mp-side-sub-badge">24H CYCLE</span>
              </div>

              <div className="mp-growth-stories-list">
                {(pulseData?.topStories || []).map((story) => (
                  <div
                    key={story.symbol}
                    className="mp-story-item"
                    onClick={() => {
                      setSelectedCompanySymbol(story.symbol);
                      showToast(`Filtered feed to ${story.symbol}`);
                    }}
                    title={`Click to filter news for ${story.symbol}`}
                  >
                    <div className="mp-story-info">
                      <div className="mp-story-headline-row">
                        <span className="mp-story-sym">{story.symbol}</span>
                        <span className="mp-story-delta">{story.change}</span>
                      </div>
                      <p className="mp-story-catalyst">{story.catalyst}</p>
                    </div>

                    <svg className="mp-sparkline" viewBox="0 0 64 32">
                      <path
                        d={story.path || 'M0 24 L12 20 L24 22 L36 14 L48 16 L64 4'}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET C: Trending Keywords Cloud */}
            <div className="mp-side-card">
              <div className="mp-side-header">
                <div className="mp-side-title-group">
                  <span className="mp-side-icon">#</span>
                  <h3 className="mp-side-title">Trending Topics</h3>
                </div>
                <span className="mp-side-badge green">ACCELERATING</span>
              </div>

              <div className="mp-tag-cloud">
                {(pulseData?.trendingTopics || []).map((t, idx) => (
                  <button
                    key={idx}
                    className="mp-tag-btn"
                    onClick={() => {
                      const clean = t.tag.replace('#', '');
                      setSearchQuery(clean);
                      showToast(`Searching for ${t.tag}`);
                    }}
                  >
                    <span>{t.tag}</span>
                    {t.change && <strong className="mp-tag-delta">{t.change}</strong>}
                  </button>
                ))}
              </div>
            </div>

            {/* WIDGET D: Company Growth Heatmap Widget */}
            <div className="mp-side-card">
              <div className="mp-side-header">
                <div className="mp-side-title-group">
                  <span className="mp-side-icon">▦</span>
                  <h3 className="mp-side-title">Company Growth Heatmap</h3>
                </div>
                <span className="mp-side-sub-badge">S&amp;P 500 / TECH</span>
              </div>

              <div className="mp-heatmap-grid">
                {(pulseData?.growthHeatmap || []).map((hm) => {
                  const isLong = hm.symbol === 'TSLA';
                  return (
                    <div
                      key={hm.symbol}
                      className={`mp-heatmap-tile ${hm.isUp ? 'tile-up' : 'tile-down'} ${
                        isLong ? 'col-span-3' : ''
                      }`}
                      onClick={() => {
                        setSelectedCompanySymbol(hm.symbol);
                        showToast(`Filtered feed to ${hm.symbol}`);
                      }}
                      title={`Filter news for ${hm.symbol}`}
                    >
                      <div className="mp-tile-top">
                        <span className="mp-tile-sym">{hm.symbol}</span>
                        <span className="mp-tile-tag">{hm.tag}</span>
                      </div>
                      {hm.desc && <div className="mp-tile-desc">{hm.desc}</div>}
                      <div className="mp-tile-delta">{hm.change}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mp-heatmap-legend">
                <span>Crimson (-3%)</span>
                <span className="mp-legend-bar"></span>
                <span>Emerald (+5%)</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Alert Configuration Modal */}
      {alertModalOpen && (
        <div className="mp-modal-backdrop" onClick={() => setAlertModalOpen(false)}>
          <div className="mp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3>Configure Real-Time News Alerts</h3>
              <button
                className="mp-modal-close"
                onClick={() => setAlertModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="mp-modal-body">
              <label>Notify on Keywords or Ticker:</label>
              <input
                type="text"
                className="mp-search-input"
                value={alertKeyword}
                onChange={(e) => setAlertKeyword(e.target.value)}
                placeholder="e.g. Blackwell, Capex, Target Upgrade"
              />
              <div className="mp-modal-options">
                <label className="mp-checkbox-label">
                  <input type="checkbox" defaultChecked /> Push notification on High-Impact events
                </label>
                <label className="mp-checkbox-label">
                  <input type="checkbox" defaultChecked /> Instant audio chime on Earnings Beat
                </label>
                <label className="mp-checkbox-label">
                  <input type="checkbox" defaultChecked /> Realtime Tavily AI Sentiment Summary
                </label>
              </div>
            </div>
            <div className="mp-modal-footer">
              <button
                className="mp-btn-secondary"
                onClick={() => setAlertModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="mp-btn-primary"
                onClick={() => {
                  setAlertModalOpen(false);
                  showToast(`Alert created for "${alertKeyword}"!`);
                }}
              >
                Save Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
