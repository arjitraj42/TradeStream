import React, { useState } from 'react';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';

function App() {
  const [page, setPage] = useState('home');

  return (
    <div>
      {(page === 'home' || page === 'welcome') && (
        <Home onGetStarted={() => setPage('welcome')} />
      )}

      {page === 'welcome' && (
        <Welcome onFinish={() => setPage('dashboard')} />
      )}

      {page === 'dashboard' && (
        <Dashboard onBackToHome={() => setPage('home')} />
      )}
    </div>
  );
}

export default App;
