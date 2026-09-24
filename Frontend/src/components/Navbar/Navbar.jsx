import React from 'react';
import Button from '../Button/Button';
import './Navbar.css';

export default function Navbar({ onGetStarted }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-dot"></span>
        <span>public</span>
      </div>

      <nav>
        <ul className="navbar-menu">
          <li className="navbar-link">Invest</li>
          <li className="navbar-link">Resources</li>
          <li className="navbar-link">Company</li>
          <li className="navbar-link">Premium</li>
        </ul>
      </nav>

      <div className="navbar-actions">
        <Button variant="secondary" size="sm" onClick={onGetStarted}>
          Sign In
        </Button>
        <Button variant="primary" size="sm" onClick={onGetStarted}>
          Get Started
        </Button>
      </div>
    </header>
  );
}
