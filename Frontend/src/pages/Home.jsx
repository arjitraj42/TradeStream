import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Button from '../components/Button/Button';
import InteractiveGrid from '../features/market/InteractiveGrid';
import './Home.css';

export default function Home({ onGetStarted }) {
  return (
    <div className="home-page">
      <Navbar onGetStarted={onGetStarted} />
      
      <main className="hero-section">
        {/* Full-coverage Interactive Grid Background */}
        <InteractiveGrid />

        {/* Soft Radial Aura Glow behind Hero */}
        <div className="hero-aura-glow"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">One place for all your investing</h1>
          
          <p className="hero-subtitle">
            Invest in stocks, treasuries, ETFs, crypto, and alternative assets all in one place—and get the insights that matter to your portfolio.
          </p>
          
          <div className="hero-cta">
            <Button
              variant="primary"
              size="lg"
              className="hero-btn"
              onClick={onGetStarted}
            >
              Get started
            </Button>
          </div>
        </div>

        {/* Hero Visual Mockups */}
        <div className="hero-visuals">
          {/* Desktop Laptop Dashboard Frame */}
          <div className="mockup-desktop" onClick={onGetStarted} style={{ cursor: 'pointer' }}>
            <div className="mockup-address-bar">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
              <div className="url-field">public.com/invest</div>
            </div>
            
            <div className="mockup-body">
              {/* Sidebar */}
              <div className="mockup-sidebar">
                <div className="brand-logo-text">public</div>
                <div className="sidebar-menu">
                  <div className="menu-item active">
                    <span className="item-icon">📊</span> Portfolio
                  </div>
                  <div className="menu-item">
                    <span className="item-icon">🔍</span> Explore
                  </div>
                  <div className="menu-item">
                    <span className="item-icon">⚡</span> Yield
                  </div>
                  <div className="menu-item">
                    <span className="item-icon">🪙</span> Crypto
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="mockup-main">
                <div className="top-tickers-bar">
                  <span className="ticker-label">The stock market is open</span>
                  <div className="ticker-chip">
                    <span className="chip-name">S&P 500</span>
                    <span className="chip-val green">+0.65%</span>
                  </div>
                  <div className="ticker-chip">
                    <span className="chip-name">NASDAQ</span>
                    <span className="chip-val green">+1.24%</span>
                  </div>
                  <div className="ticker-chip">
                    <span className="chip-name">Dow Jones</span>
                    <span className="chip-val green">+0.42%</span>
                  </div>
                </div>

                <div className="portfolio-header">
                  <div className="portfolio-amount">$125,367.10</div>
                  <div className="portfolio-gain-pill">
                    Your portfolio has gained <strong>+$7,349.88 (6.45%) today</strong>
                  </div>
                </div>

                <div className="chart-container">
                  <svg viewBox="0 0 500 130" preserveAspectRatio="none" className="line-chart-svg">
                    <path
                      d="M0,100 C80,105 120,80 180,75 C240,70 280,45 350,40 C420,35 460,15 500,10"
                      fill="none"
                      stroke="#00c805"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M0,100 C80,105 120,80 180,75 C240,70 280,45 350,40 C420,35 460,15 500,10 L500,130 L0,130 Z"
                      fill="url(#green-chart-gradient)"
                      opacity="0.12"
                    />
                    <defs>
                      <linearGradient id="green-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00c805" stopOpacity="1" />
                        <stop offset="100%" stopColor="#00c805" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Phone Mockup Frame */}
          <div className="mockup-mobile" onClick={onGetStarted} style={{ cursor: 'pointer' }}>
            <div className="mobile-speaker"></div>
            <div className="mobile-inner">
              <div className="mobile-brand">public</div>
              <div className="mobile-balance-title">Your account</div>
              <div className="mobile-amount">$125,367.10</div>
              <div className="mobile-gain">+ $7,349.88 Today</div>

              <div className="mobile-chart">
                <svg viewBox="0 0 200 90" preserveAspectRatio="none" className="line-chart-svg">
                  <path
                    d="M0,75 C40,80 70,55 120,40 C170,25 180,15 200,10"
                    fill="none"
                    stroke="#00c805"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              <div className="mobile-categories">
                <span className="cat-pill active">Equities</span>
                <span className="cat-pill">Crypto</span>
                <span className="cat-pill">ETFs</span>
                <span className="cat-pill">Treasuries</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
