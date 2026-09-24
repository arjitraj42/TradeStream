import React, { useState } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="app-root">
      {currentPage === 'home' ? (
        <Home onGetStarted={() => setCurrentPage('dashboard')} />
      ) : (
        <Dashboard onBackToHome={() => setCurrentPage('home')} />
      )}
    </div>
  );
}

export default App;
