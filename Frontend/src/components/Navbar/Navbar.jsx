import React from 'react';
import './Navbar.css';

export default function Navbar({ onGetStarted }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="ts-navbar">
      <div className="ts-navbar-brand" onClick={onGetStarted}>
        <div className="ts-brand-icon">
          <span>TX</span>
        </div>
        <span className="ts-brand-title">TradeX</span>
        <span className="ts-brand-badge">PRO ENGINE</span>
      </div>

      <nav className="ts-nav-center">
        <span className="ts-nav-item" onClick={() => scrollToSection('features-bento')}>
          Bento Features
        </span>
        <span className="ts-nav-item" onClick={() => scrollToSection('engine-speed')}>
          Engine Speed
        </span>
        <span className="ts-nav-item" onClick={() => scrollToSection('benchmark-matrix')}>
          Benchmark Matrix
        </span>
        <span className="ts-nav-item" onClick={onGetStarted}>
          Indian Startups (₹)
        </span>
      </nav>

      <div className="ts-nav-actions">
        <button className="ts-nav-btn primary" onClick={onGetStarted}>
          <span>Launch Terminal</span>
          <span className="ts-btn-arrow">↗</span>
        </button>
      </div>
    </header>
  );
}
