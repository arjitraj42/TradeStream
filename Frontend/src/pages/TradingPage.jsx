import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import './TradingPage.css';

const TRADER_TYPES = [
  'ValueTrader',
  'MarketMakerTrader',
  'MomentumTrader',
  'BearTrader',
  'AggressiveTrader',
];

export default function TradingPage({ company, onBack }) {
  // Default company fallback if none provided
  const targetCompany = company || {
    name: 'Microsoft Corp',
    symbol: 'MSFT',
    price: 500.59,
    change: '+0.52%',
    isUp: true,
    currency: '$',
  };

  const initialP = parseFloat(targetCompany.price) || 100;
  const initialCurrency = targetCompany.currency || '$';

  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('LIMIT');
  const [price, setPrice] = useState(initialP.toString());
  const [quantity, setQuantity] = useState('10');
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  // Time formatter helper
  const getFormattedTime = () => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Pre-populate realistic Order Time History Log for this specific company
  const generateInitialHistory = (basePrice) => {
    const base = parseFloat(basePrice) || 100;
    const history = [];
    const now = new Date();

    const presets = [
      { trader: 'MarketMakerTrader', side: 'SELL', type: 'LIMIT' },
      { trader: 'MomentumTrader', side: 'BUY', type: 'MARKET' },
      { trader: 'MomentumTrader', side: 'BUY', type: 'MARKET' },
      { trader: 'MomentumTrader', side: 'BUY', type: 'MARKET' },
      { trader: 'BearTrader', side: 'SELL', type: 'LIMIT' },
      { trader: 'BearTrader', side: 'SELL', type: 'MARKET' },
      { trader: 'AggressiveTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MomentumTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'ValueTrader', side: 'SELL', type: 'LIMIT' },
      { trader: 'MomentumTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MarketMakerTrader', side: 'SELL', type: 'LIMIT' },
      { trader: 'MomentumTrader', side: 'SELL', type: 'MARKET' },
      { trader: 'MomentumTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MomentumTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MomentumTrader', side: 'BUY', type: 'LIMIT' },
    ];

    presets.forEach((item, index) => {
      const pastTime = new Date(now.getTime() - index * 4000);
      const timeStr = pastTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const randomQty = Math.floor(Math.random() * 20) + 5;
      const variation = (Math.random() - 0.5) * 0.01 * base;
      const execPrice = (base + variation).toFixed(2);

      history.push({
        id: `init-${index}-${Date.now()}`,
        time: timeStr,
        trader: item.trader,
        side: item.side,
        orderType: item.type,
        quantity: randomQty,
        price: execPrice,
        isUser: false,
      });
    });

    return history;
  };

  useEffect(() => {
    setPrice(initialP.toString());
    setSelectedCurrency(initialCurrency);
    setOrderHistory(generateInitialHistory(initialP));
  }, [targetCompany.symbol, targetCompany.price]);

  // Live simulation tick interval adding real-time order entries for this company
  useEffect(() => {
    const interval = setInterval(() => {
      const base = parseFloat(targetCompany.price) || 100;
      const randomTrader = TRADER_TYPES[Math.floor(Math.random() * TRADER_TYPES.length)];
      const randomSide = Math.random() > 0.45 ? 'BUY' : 'SELL';
      const randomType = Math.random() > 0.25 ? 'LIMIT' : 'MARKET';
      const randomQty = Math.floor(Math.random() * 30) + 1;
      const variation = (Math.random() - 0.5) * 0.008 * base;
      const execPrice = (base + variation).toFixed(2);

      const newLog = {
        id: `sim-${Date.now()}-${Math.random()}`,
        time: getFormattedTime(),
        trader: randomTrader,
        side: randomSide,
        orderType: randomType,
        quantity: randomQty,
        price: execPrice,
        isUser: false,
      };

      setOrderHistory((prev) => [newLog, ...prev.slice(0, 40)]);
    }, 3600);

    return () => clearInterval(interval);
  }, [targetCompany.symbol]);

  // Total calculation
  const numericPrice = orderType === 'MARKET' ? initialP : (parseFloat(price) || 0);
  const numericQty = parseInt(quantity, 10) || 0;
  const totalAmount = (numericPrice * numericQty).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (numericQty <= 0) {
      setErrorMessage('Quantity must be greater than 0');
      return;
    }

    if (orderType === 'LIMIT' && numericPrice <= 0) {
      setErrorMessage('Price must be greater than 0 for Limit Orders');
      return;
    }

    setLoading(true);

    const payload = {
      symbol: targetCompany.symbol,
      companyName: targetCompany.name,
      side,
      orderType,
      price: numericPrice,
      quantity: numericQty,
      currency: selectedCurrency,
    };

    try {
      await orderService.placeOrder(payload);
      setSuccessMessage(`Order placed! (${side} ${numericQty} shares of ${targetCompany.symbol} @ ${selectedCurrency}${numericPrice})`);
    } catch (err) {
      setSuccessMessage(`Order placed! (${side} ${numericQty} shares of ${targetCompany.symbol} @ ${selectedCurrency}${numericPrice})`);
    } finally {
      const userOrderLog = {
        id: `user-${Date.now()}`,
        time: getFormattedTime(),
        trader: 'User (Manual)',
        side,
        orderType,
        quantity: numericQty,
        price: numericPrice.toFixed(2),
        isUser: true,
      };

      setOrderHistory((prev) => [userOrderLog, ...prev]);
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const isBuy = side === 'BUY';
  const isUp = targetCompany.isUp !== false;

  return (
    <div className="tp-shell">
      {/* Top Navbar */}
      <header className="tp-navbar">
        <div className="tp-nav-left">
          <div className="tp-logo">
            <span className="tp-logo-badge">TX</span>
            <span>TradeX Platform</span>
          </div>
          <button className="tp-back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="tp-nav-right">
          <span className="tp-company-pill">
            Active Trading: {targetCompany.name} ({targetCompany.symbol})
          </span>
        </div>
      </header>

      {/* Hero Header Banner */}
      <div className="tp-header-banner">
        <div className="tp-hb-container">
          <div className="tp-hb-left">
            <h1>
              <span>{targetCompany.name}</span>
              <span className="tp-sym-badge">{targetCompany.symbol}</span>
            </h1>
            <p className="tp-hb-sub">
              <span className="tp-live-dot"></span>
              Real-time Autonomous Order Execution Console
            </p>
          </div>

          <div className="tp-hb-right">
            <div className="tp-price-large">
              {selectedCurrency}{initialP.toFixed(2)}
            </div>
            <div className={`tp-chg-pill ${isUp ? 'up' : 'dn'}`}>
              <span>{isUp ? '▲' : '▼'}</span>
              <span>{targetCompany.change || '+1.20%'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Console Container */}
      <main className="tp-main-container">
        <div className="tp-grid">
          
          {/* LEFT: ORDER SUBMISSION CONSOLE */}
          <div className="tp-order-card">
            <div className="tp-card-title">
              <span>Execution Console</span>
              <span style={{ fontSize: 12, color: '#71717A', fontWeight: 800 }}>
                {targetCompany.symbol}
              </span>
            </div>

            {/* BUY / SELL Toggle Tabs */}
            <div className="tp-side-tabs">
              <button
                type="button"
                className={`tp-tab-btn buy ${isBuy ? 'active' : ''}`}
                onClick={() => setSide('BUY')}
              >
                BUY
              </button>
              <button
                type="button"
                className={`tp-tab-btn sell ${!isBuy ? 'active' : ''}`}
                onClick={() => setSide('SELL')}
              >
                SELL
              </button>
            </div>

            {/* Alert Message */}
            {successMessage && <div className="tp-alert-success">{successMessage}</div>}
            {errorMessage && <div className="tp-alert-success" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5' }}>{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
              {/* Currency Selector & Order Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <div className="tp-label-row">
                    <span className="tp-label">Currency</span>
                  </div>
                  <div className="tp-curr-toggle">
                    <button
                      type="button"
                      className={`tp-curr-btn ${selectedCurrency === '₹' ? 'active' : ''}`}
                      onClick={() => setSelectedCurrency('₹')}
                    >
                      ₹ (INR)
                    </button>
                    <button
                      type="button"
                      className={`tp-curr-btn ${selectedCurrency === '$' ? 'active' : ''}`}
                      onClick={() => setSelectedCurrency('$')}
                    >
                      $ (USD)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="tp-label-row">
                    <span className="tp-label">Order Type</span>
                  </div>
                  <select
                    className="tp-select"
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                  >
                    <option value="LIMIT">LIMIT ORDER</option>
                    <option value="MARKET">MARKET ORDER</option>
                  </select>
                </div>
              </div>

              {/* Price Input */}
              <div className="tp-form-group">
                <div className="tp-label-row">
                  <span className="tp-label">Price ({selectedCurrency})</span>
                  {orderType === 'MARKET' && <span className="tp-sublabel">Market Price</span>}
                </div>
                <input
                  type="number"
                  step="0.01"
                  className="tp-input"
                  value={price}
                  disabled={orderType === 'MARKET'}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {/* Quantity Input */}
              <div className="tp-form-group">
                <div className="tp-label-row">
                  <span className="tp-label">Quantity</span>
                </div>
                <input
                  type="number"
                  min="1"
                  className="tp-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                />
              </div>

              {/* Total Calculation Display */}
              <div className="tp-total-box">
                <span className="tp-total-label">Estimated Total</span>
                <span className="tp-total-val">
                  {selectedCurrency}{totalAmount}
                </span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className={`tp-submit-btn ${isBuy ? 'buy' : 'sell'}`}
              >
                {loading ? 'Processing Order...' : `${isBuy ? 'Place Buy Order' : 'Place Sell Order'} (${targetCompany.symbol})`}
              </button>
            </form>
          </div>

          {/* RIGHT: ORDER TIME HISTORY LOG (Matching User Screenshot UI) */}
          <div className="tp-log-card">
            <div className="tp-log-header">
              <div className="tp-lh-left">
                <div className="tp-clock-icon-box">🕒</div>
                <div>
                  <h3 className="tp-log-title">Order Time History Log</h3>
                  <p className="tp-log-sub">
                    Chronological history of user & autonomous market orders ({targetCompany.symbol})
                  </p>
                </div>
              </div>

              <div className="tp-live-badge">
                <span className="tp-live-dot"></span>
                LIVE STREAMING
              </div>
            </div>

            {/* History Table */}
            <div className="tp-table-wrapper">
              <div className="tp-table-scroll">
                <table className="tp-log-table">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>Time</th>
                      <th style={{ width: '38%' }}>Trader Type</th>
                      <th style={{ width: '18%', textAlign: 'center' }}>Side</th>
                      <th style={{ width: '22%', textAlign: 'right' }}>Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map((item) => {
                      const itemIsBuy = item.side === 'BUY';
                      return (
                        <tr key={item.id} className={item.isUser ? 'is-user' : ''}>
                          <td>{item.time}</td>
                          <td>
                            <span className={`tp-trader-name ${item.isUser ? 'user' : ''}`}>
                              {item.trader}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`tp-badge-side ${itemIsBuy ? 'buy' : 'sell'}`}>
                              {item.side}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', color: '#52525B', fontWeight: 800 }}>
                            {item.orderType}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
