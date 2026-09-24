import React, { useState } from 'react';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import TradingPage from './pages/TradingPage';
import EngineSimulatorPage from './pages/EngineSimulatorPage';

function App() {
  const [page, setPage] = useState('home');
  const [activeTradingCompany, setActiveTradingCompany] = useState(null);

  const handleOpenTradePage = (companyData) => {
    setActiveTradingCompany(companyData);
    setPage('trading');
  };

  return (
    <div>
      {(page === 'home' || page === 'welcome') && (
        <Home onGetStarted={() => setPage('welcome')} />
      )}

      {page === 'welcome' && (
        <Welcome onFinish={() => setPage('dashboard')} />
      )}

      {page === 'dashboard' && (
        <Dashboard
          onBackToHome={() => setPage('home')}
          onOpenTradePage={handleOpenTradePage}
          onOpenEngineSimulator={() => setPage('engine')}
        />
      )}

      {page === 'trading' && (
        <TradingPage
          company={activeTradingCompany}
          onBack={() => setPage('dashboard')}
        />
      )}

      {page === 'engine' && (
        <EngineSimulatorPage
          onBack={() => setPage('dashboard')}
        />
      )}
    </div>
  );
}

export default App;
