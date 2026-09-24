import React, { useEffect } from 'react';
import './Welcome.css';

export default function Welcome({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="welcome-overlay">
      <div className="welcome-text-block">
        <h1 className="welcome-heading">Welcome to Invest Agent</h1>
        <p className="welcome-sub">Let's start your journey</p>
      </div>
    </div>
  );
}
