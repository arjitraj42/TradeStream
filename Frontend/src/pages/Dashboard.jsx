import React, { useState, useEffect } from 'react';
import {
  POPULAR_COMPANIES,
  fetchCompanyGrowthData,
} from '../features/company/companyService';
import StockGrowthChart from '../features/market/StockGrowthChart';
import './Dashboard.css';

export default function Dashboard({ onBackToHome }) {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch company data whenever selectedSymbol changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchCompanyGrowthData(selectedSymbol, '1Week').then((data) => {
      if (isMounted) {
        setCompanyData(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol]);

  // Filter companies for search bar dropdown
  const filteredCompanies = POPULAR_COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="eval-dashboard">
      {/* Top Navbar Header */}
      <header className="eval-navbar">
        <div className="nav-left">
          <button className="back-btn" onClick={onBackToHome} title="Return to Home">
            ← Home
          </button>
          <div className="brand-badge">
            <span className="brand-dot"></span>
            <strong>Company Growth & Valuation Intelligence</strong>
          </div>
        </div>

        {/* Global Company Search Bar */}
        <div className="nav-search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search company or ticker (e.g. AAPL, NVDA, MSFT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <div className="search-dropdown">
              {filteredCompanies.map((c) => (
                <div
                  key={c.symbol}
                  className="search-item"
                  onClick={() => {
                    setSelectedSymbol(c.symbol);
                    setSearchQuery('');
                  }}
                >
                  <span className="search-logo">{c.logo}</span>
                  <div className="search-info">
                    <span className="search-symbol">{c.symbol}</span>
                    <span className="search-name">{c.name}</span>
                  </div>
                  <span className={`search-price ${c.isUp ? 'green' : 'red'}`}>
                    {c.change}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nav-right">
          <span className="live-status">
            <span className="live-pulse"></span>
            Live Intelligence Engine
          </span>
        </div>
      </header>

      {/* Horizontal Quick-Select Company Ticker Strip */}
      <section className="ticker-strip">
        {POPULAR_COMPANIES.map((c) => (
          <button
            key={c.symbol}
            className={`ticker-tab ${selectedSymbol === c.symbol ? 'active' : ''}`}
            onClick={() => setSelectedSymbol(c.symbol)}
          >
            <span className="tab-logo">{c.logo}</span>
            <div className="tab-details">
              <span className="tab-symbol">{c.symbol}</span>
              <span className={`tab-change ${c.isUp ? 'green' : 'red'}`}>{c.change}</span>
            </div>
          </button>
        ))}
      </section>

      {/* Main Full-Width Content Container */}
      <main className="eval-content">
        {loading || !companyData ? (
          <div className="eval-loader-card">
            <div className="loader-spinner"></div>
            <p>Fetching and evaluating growth intelligence for {selectedSymbol}...</p>
          </div>
        ) : (
          <>
            {/* Top Company Hero Banner */}
            <div className="company-hero-banner">
              <div className="banner-left">
                <div className="company-badge-large">
                  <span className="badge-symbol">{companyData.symbol}</span>
                </div>
                <div>
                  <h1 className="company-heading">{companyData.name}</h1>
                  <div className="company-meta-tags">
                    <span className="sector-tag">{companyData.sector}</span>
                    <span className="data-source-tag">Source: {companyData.dataSource}</span>
                  </div>
                </div>
              </div>

              <div className="banner-right">
                <div className="price-display">
                  <span className="currency">{companyData.currency}</span>
                  <span className="price-val">{companyData.price}</span>
                  <span className={`badge-pill ${companyData.isUp ? 'green' : 'red'}`}>
                    {companyData.change}
                  </span>
                </div>
                <div className="score-badge-group">
                  <span className="growth-score-num">Growth Score: {companyData.growthScore}/100</span>
                  <span className="growth-status-text">{companyData.growthStatus}</span>
                </div>
              </div>
            </div>

            {/* Growth Summary Narrative */}
            <div className="growth-summary-box">
              <span className="summary-icon">💡</span>
              <p>
                <strong>Evaluation Summary:</strong> {companyData.summary}
              </p>
            </div>

            {/* Chart & Fundamentals Workspace */}
            <div className="workspace-grid">
              {/* Realistic High-Fidelity Stock Growth Chart (Matching Reference Image) */}
              <StockGrowthChart
                companyName={companyData.name}
                symbol={companyData.symbol}
                price={`${companyData.currency}${companyData.price}`}
                change={companyData.change}
                isUp={companyData.isUp}
                lastUpdate="14.30"
                recommendation={companyData.metrics.analystRating.split(' ')[0] || 'BUY'}
                recommendationScore={companyData.metrics.analystRating}
              />

              {/* Fundamental Growth Metrics Card */}
              <div className="metrics-card">
                <h3>Financial Health & Growth Evaluation</h3>
                <div className="metrics-grid">
                  <div className="metric-cell">
                    <span className="metric-label">Revenue Growth (YoY)</span>
                    <span className="metric-val green">{companyData.metrics.revGrowth}</span>
                    <span className="metric-hint">Top-line expansion rate</span>
                  </div>

                  <div className="metric-cell">
                    <span className="metric-label">Net Profit Margin</span>
                    <span className="metric-val">{companyData.metrics.netMargin}</span>
                    <span className="metric-hint">Operating profitability</span>
                  </div>

                  <div className="metric-cell">
                    <span className="metric-label">P/E Ratio</span>
                    <span className="metric-val">{companyData.metrics.peRatio}</span>
                    <span className="metric-hint">Valuation multiple</span>
                  </div>

                  <div className="metric-cell">
                    <span className="metric-label">PEG Ratio</span>
                    <span className="metric-val">{companyData.metrics.pegRatio}</span>
                    <span className="metric-hint">P/E adjusted for growth</span>
                  </div>

                  <div className="metric-cell">
                    <span className="metric-label">Return on Equity (ROE)</span>
                    <span className="metric-val green">{companyData.metrics.roe}</span>
                    <span className="metric-hint">Capital efficiency</span>
                  </div>

                  <div className="metric-cell">
                    <span className="metric-label">Free Cash Flow</span>
                    <span className="metric-val">{companyData.metrics.freeCashFlow}</span>
                    <span className="metric-hint">Reinvestment capacity</span>
                  </div>

                  <div className="metric-cell">
                    <span className="metric-label">Debt to Equity</span>
                    <span className="metric-val">{companyData.metrics.debtToEquity}</span>
                    <span className="metric-hint">Leverage & solvency</span>
                  </div>

                  <div className="metric-cell">
                    <span className="metric-label">Analyst Recommendation</span>
                    <span className="metric-val green">{companyData.metrics.analystRating}</span>
                    <span className="metric-hint">Buy/Hold/Sell consensus</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Evaluation Comparison Grid */}
            <div className="comparison-section">
              <h3>Compare Peer Growth Profiles</h3>
              <div className="peer-grid">
                {POPULAR_COMPANIES.slice(0, 4).map((peer) => (
                  <div
                    key={peer.symbol}
                    className={`peer-card ${selectedSymbol === peer.symbol ? 'active' : ''}`}
                    onClick={() => setSelectedSymbol(peer.symbol)}
                  >
                    <div className="peer-top">
                      <span className="peer-logo">{peer.logo}</span>
                      <div>
                        <strong>{peer.name}</strong>
                        <span className="peer-ticker">{peer.symbol}</span>
                      </div>
                    </div>
                    <div className="peer-bottom">
                      <span className="peer-mcap">Market Cap: {peer.marketCap}</span>
                      <span className={`peer-change ${peer.isUp ? 'green' : 'red'}`}>
                        {peer.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
