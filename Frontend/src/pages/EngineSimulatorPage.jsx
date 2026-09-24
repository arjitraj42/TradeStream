import React, { useState, useEffect, useRef } from 'react';
import { MatchingEngine } from '../engine/MatchingEngine';
import './EngineSimulatorPage.css';

const SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'RELIANCE'];

export default function EngineSimulatorPage({ onBack }) {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  
  // Matching Engine Ref
  const engineRef = useRef(new MatchingEngine('AAPL'));

  // Form State
  const [side, setSide] = useState('BUY'); // 'BUY' | 'SELL'
  const [orderType, setOrderType] = useState('LIMIT'); // 'LIMIT' | 'MARKET'
  const [price, setPrice] = useState('180.00');
  const [quantity, setQuantity] = useState('10');

  // Reactive State snapshots for UI update
  const [book, setBook] = useState({ bids: [], asks: [], bestBid: 0, bestAsk: 0, spread: 0, midPrice: 0 });
  const [openOrders, setOpenOrders] = useState([]);
  const [trades, setTrades] = useState([]);
  const [metrics, setMetrics] = useState({ ordersProcessed: 0, tradesExecuted: 0, ordersPerSec: 0, avgLatencyMs: 0.12 });
  const [queue, setQueue] = useState([]);

  // AI Agent States
  const [aiActive, setAiActive] = useState({ bull: false, bear: false, marketMaker: false, autoLoop: false });

  // Refresh UI snapshots from engine
  const refreshEngineState = () => {
    const engine = engineRef.current;
    setBook(engine.getOrderBook(10));
    setOpenOrders(engine.getOpenOrders());
    setTrades([...engine.trades]);
    setMetrics(engine.getMetrics());
    setQueue([...engine.recentQueue]);
  };

  // Initial Seed on mount or symbol change
  useEffect(() => {
    const basePrices = { AAPL: 180.00, TSLA: 240.50, NVDA: 120.00, MSFT: 420.00, RELIANCE: 2950.00 };
    const baseP = basePrices[selectedSymbol] || 180.00;
    
    engineRef.current.setSymbol(selectedSymbol, baseP);
    setPrice(baseP.toFixed(2));
    refreshEngineState();
  }, [selectedSymbol]);

  // AI Agent Interval Simulators
  useEffect(() => {
    const interval = setInterval(() => {
      const engine = engineRef.current;
      const currentBook = engine.getOrderBook(5);
      const base = currentBook.midPrice || 180.00;
      let orderPlaced = false;

      // 1. Bull Agent (aggressive buy orders)
      if (aiActive.bull) {
        const p = (base + (Math.random() * 0.4)).toFixed(2);
        const q = Math.floor(Math.random() * 20) + 5;
        const type = Math.random() > 0.3 ? 'LIMIT' : 'MARKET';
        engine.processOrder({ side: 'BUY', type, price: p, quantity: q, trader: 'BullAgent' });
        orderPlaced = true;
      }

      // 2. Bear Agent (aggressive sell orders)
      if (aiActive.bear) {
        const p = (base - (Math.random() * 0.4)).toFixed(2);
        const q = Math.floor(Math.random() * 20) + 5;
        const type = Math.random() > 0.3 ? 'LIMIT' : 'MARKET';
        engine.processOrder({ side: 'SELL', type, price: p, quantity: q, trader: 'BearAgent' });
        orderPlaced = true;
      }

      // 3. Market Maker Agent (paired bids/asks around mid price)
      if (aiActive.marketMaker) {
        const bidP = (base - (Math.random() * 0.15 + 0.05)).toFixed(2);
        const askP = (base + (Math.random() * 0.15 + 0.05)).toFixed(2);
        const q = Math.floor(Math.random() * 30) + 10;
        engine.processOrder({ side: 'BUY', type: 'LIMIT', price: bidP, quantity: q, trader: 'MarketMaker' });
        engine.processOrder({ side: 'SELL', type: 'LIMIT', price: askP, quantity: q, trader: 'MarketMaker' });
        orderPlaced = true;
      }

      // 4. General Auto Loop
      if (aiActive.autoLoop && !aiActive.bull && !aiActive.bear && !aiActive.marketMaker) {
        const isBuy = Math.random() > 0.5;
        const p = (base + (Math.random() - 0.5) * 0.5).toFixed(2);
        const q = Math.floor(Math.random() * 15) + 1;
        engine.processOrder({ side: isBuy ? 'BUY' : 'SELL', type: 'LIMIT', price: p, quantity: q, trader: 'AutoSim' });
        orderPlaced = true;
      }

      if (orderPlaced) {
        refreshEngineState();
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [aiActive]);

  // Submit Manual User Order
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    const numQty = parseInt(quantity, 10);

    if (isNaN(numQty) || numQty <= 0) return;
    if (orderType === 'LIMIT' && (isNaN(numPrice) || numPrice <= 0)) return;

    engineRef.current.processOrder({
      symbol: selectedSymbol,
      side,
      type: orderType,
      price: numPrice,
      quantity: numQty,
      trader: 'User (Manual)',
    });

    refreshEngineState();
  };

  // Cancel Open Order
  const handleCancelOrder = (orderId) => {
    engineRef.current.cancelOrder(orderId);
    refreshEngineState();
  };

  // Quick Agents Trigger Handlers
  const triggerSingleAgent = (agentType) => {
    const engine = engineRef.current;
    const base = book.midPrice || 180.00;

    if (agentType === 'bull') {
      engine.processOrder({ side: 'BUY', type: 'LIMIT', price: (base + 0.20).toFixed(2), quantity: 25, trader: 'BullAgent' });
    } else if (agentType === 'bear') {
      engine.processOrder({ side: 'SELL', type: 'LIMIT', price: (base - 0.20).toFixed(2), quantity: 25, trader: 'BearAgent' });
    } else if (agentType === 'marketMaker') {
      engine.processOrder({ side: 'BUY', type: 'LIMIT', price: (base - 0.10).toFixed(2), quantity: 20, trader: 'MarketMaker' });
      engine.processOrder({ side: 'SELL', type: 'LIMIT', price: (base + 0.10).toFixed(2), quantity: 20, trader: 'MarketMaker' });
    }

    refreshEngineState();
  };

  const isBuy = side === 'BUY';
  const numericPrice = orderType === 'MARKET' ? (book.bestAsk || book.midPrice || 0) : parseFloat(price) || 0;
  const totalAmount = (numericPrice * (parseInt(quantity, 10) || 0)).toFixed(2);

  return (
    <div className="es-shell">
      {/* Navbar Header */}
      <header className="es-navbar">
        <div className="es-nav-left">
          <div className="es-logo">
            <span className="es-logo-badge">ENGINE</span>
            <span>TradeStream Matching Engine Simulator</span>
          </div>
          <button className="es-back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="es-sym-picker">
          {SYMBOLS.map((sym) => (
            <button
              key={sym}
              className={`es-sym-btn ${selectedSymbol === sym ? 'active' : ''}`}
              onClick={() => setSelectedSymbol(sym)}
            >
              {sym}
            </button>
          ))}
        </div>
      </header>

      {/* Engine Metrics Dashboard Cards */}
      <section className="es-metrics-bar">
        <div className="es-metrics-grid">
          <div className="es-kpi-card">
            <span className="es-kpi-label">Orders Processed</span>
            <div className="es-kpi-value cyan">{metrics.ordersProcessed}</div>
            <span className="es-kpi-sub">Total Matching Calls</span>
          </div>

          <div className="es-kpi-card">
            <span className="es-kpi-label">Trades Executed</span>
            <div className="es-kpi-value green">{metrics.tradesExecuted}</div>
            <span className="es-kpi-sub">Fills Completed</span>
          </div>

          <div className="es-kpi-card">
            <span className="es-kpi-label">Orders / Sec</span>
            <div className="es-kpi-value purple">{metrics.ordersPerSec}</div>
            <span className="es-kpi-sub">Engine Throughput</span>
          </div>

          <div className="es-kpi-card">
            <span className="es-kpi-label">Avg Latency</span>
            <div className="es-kpi-value">{metrics.avgLatencyMs} ms</div>
            <span className="es-kpi-sub">Last: {metrics.lastLatencyMs} ms</span>
          </div>

          <div className="es-kpi-card">
            <span className="es-kpi-label">Best Bid / Ask</span>
            <div className="es-kpi-value font-mono">
              <span className="green">${book.bestBid.toFixed(2)}</span> / <span className="red">${book.bestAsk.toFixed(2)}</span>
            </div>
            <span className="es-kpi-sub">Spread: ${book.spread.toFixed(2)}</span>
          </div>

          <div className="es-kpi-card">
            <span className="es-kpi-label">Open Book Depth</span>
            <div className="es-kpi-value font-mono">
              <span className="green">{book.totalOpenBids} Bids</span> | <span className="red">{book.totalOpenAsks} Asks</span>
            </div>
            <span className="es-kpi-sub">In-Memory Price Levels</span>
          </div>
        </div>
      </section>

      {/* Order Flow Visual Pipeline Animation */}
      <section className="es-pipeline-section">
        <div className="es-pipeline-container">
          <div className="es-pipe-step active">
            <div className="es-pipe-icon">1</div>
            <div className="es-pipe-info">
              <span className="es-pipe-title">Order Entry Queue</span>
              <span className="es-pipe-desc">
                {queue.length > 0 ? `${queue[0].side} ${queue[0].quantity} ${queue[0].type}` : 'Awaiting Input'}
              </span>
            </div>
          </div>

          <div className="es-pipe-arrow">➜</div>

          <div className="es-pipe-step active">
            <div className="es-pipe-icon">2</div>
            <div className="es-pipe-info">
              <span className="es-pipe-title">Matching Engine</span>
              <span className="es-pipe-desc">Price-Time Priority (FIFO)</span>
            </div>
          </div>

          <div className="es-pipe-arrow">➜</div>

          <div className="es-pipe-step active">
            <div className="es-pipe-icon">3</div>
            <div className="es-pipe-info">
              <span className="es-pipe-title">Trade Execution / Book</span>
              <span className="es-pipe-desc">{trades.length} Executed Trades</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Simulation Controls */}
      <section className="es-ai-bar">
        <div className="es-ai-container">
          <div className="es-ai-title">
            <span>🤖 AI Trader Simulation Agents</span>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
              (Passes orders through same matching engine)
            </span>
          </div>

          <div className="es-ai-buttons">
            <button
              className={`es-ai-btn bull ${aiActive.bull ? 'auto-on' : ''}`}
              onClick={() => {
                triggerSingleAgent('bull');
                setAiActive((prev) => ({ ...prev, bull: !prev.bull }));
              }}
            >
              🐂 Bull Agent {aiActive.bull ? '(Active)' : '+1 Order'}
            </button>

            <button
              className={`es-ai-btn bear ${aiActive.bear ? 'auto-on' : ''}`}
              onClick={() => {
                triggerSingleAgent('bear');
                setAiActive((prev) => ({ ...prev, bear: !prev.bear }));
              }}
            >
              🐻 Bear Agent {aiActive.bear ? '(Active)' : '+1 Order'}
            </button>

            <button
              className={`es-ai-btn mm ${aiActive.marketMaker ? 'auto-on' : ''}`}
              onClick={() => {
                triggerSingleAgent('marketMaker');
                setAiActive((prev) => ({ ...prev, marketMaker: !prev.marketMaker }));
              }}
            >
              ⚖️ Market Maker {aiActive.marketMaker ? '(Active)' : '+Paired Liquidity'}
            </button>

            <button
              className={`es-ai-btn ${aiActive.autoLoop ? 'auto-on' : ''}`}
              onClick={() => setAiActive((prev) => ({ ...prev, autoLoop: !prev.autoLoop }))}
            >
              ⚡ Continuous Simulation {aiActive.autoLoop ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </section>

      {/* Main 3-Column Terminal Layout */}
      <main className="es-main-grid">
        
        {/* PANEL 1: ORDER ENTRY PANEL */}
        <div className="es-panel">
          <div className="es-panel-head">
            <span className="es-panel-title">Order Entry</span>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>{selectedSymbol}</span>
          </div>

          {/* BUY / SELL Toggle */}
          <div className="es-side-tabs">
            <button
              type="button"
              className={`es-tab-btn buy ${isBuy ? 'active' : ''}`}
              onClick={() => setSide('BUY')}
            >
              BUY
            </button>
            <button
              type="button"
              className={`es-tab-btn sell ${!isBuy ? 'active' : ''}`}
              onClick={() => setSide('SELL')}
            >
              SELL
            </button>
          </div>

          <form onSubmit={handleSubmitOrder}>
            {/* Order Type */}
            <div className="es-form-group">
              <div className="es-label-row">
                <span className="es-label">Order Type</span>
              </div>
              <select
                className="es-select"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="LIMIT">LIMIT ORDER</option>
                <option value="MARKET">MARKET ORDER</option>
              </select>
            </div>

            {/* Price Input */}
            <div className="es-form-group">
              <div className="es-label-row">
                <span className="es-label">Price ($)</span>
                {orderType === 'MARKET' && <span style={{ fontSize: 10, color: '#F59E0B' }}>Market Execution</span>}
              </div>
              <input
                type="number"
                step="0.01"
                className="es-input"
                value={price}
                disabled={orderType === 'MARKET'}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Quantity Input & Presets */}
            <div className="es-form-group">
              <div className="es-label-row">
                <span className="es-label">Quantity</span>
              </div>
              <input
                type="number"
                min="1"
                className="es-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
              />
              <div className="es-quick-qty">
                <button type="button" className="es-qq-btn" onClick={() => setQuantity('10')}>10</button>
                <button type="button" className="es-qq-btn" onClick={() => setQuantity('25')}>25</button>
                <button type="button" className="es-qq-btn" onClick={() => setQuantity('50')}>50</button>
                <button type="button" className="es-qq-btn" onClick={() => setQuantity('100')}>100</button>
              </div>
            </div>

            {/* Total Display */}
            <div className="es-total-box">
              <span className="es-label">Estimated Total</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#FFFFFF' }}>
                ${totalAmount}
              </span>
            </div>

            {/* Submit Button */}
            <button type="submit" className={`es-submit-btn ${isBuy ? 'buy' : 'sell'}`}>
              Submit {isBuy ? 'BUY' : 'SELL'} Order ({selectedSymbol})
            </button>
          </form>
        </div>

        {/* PANEL 2: LIVE ORDER BOOK & MARKET DEPTH SUMMARY */}
        <div className="es-panel">
          <div className="es-panel-head">
            <span className="es-panel-title">Live Order Book & Depth</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>Top 10 Levels</span>
          </div>

          <div className="es-ob-container">
            <div className="es-ob-header">
              <span>Price ($)</span>
              <span style={{ textAlign: 'right' }}>Size</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>

            {/* SELL SIDE (ASKS - Sorted highest to lowest top-down for standard depth) */}
            <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
              {book.asks.map((ask) => (
                <div
                  key={`ask-${ask.price}`}
                  className="es-ob-row"
                  onClick={() => { setPrice(ask.price.toFixed(2)); setSide('BUY'); }}
                >
                  <div
                    className="es-depth-fill ask"
                    style={{ width: `${Math.min(100, (ask.totalQuantity / book.maxAskQty) * 100)}%` }}
                  />
                  <span className="es-ob-price ask">${ask.price.toFixed(2)}</span>
                  <span style={{ textAlign: 'right' }}>{ask.totalQuantity}</span>
                  <span style={{ textAlign: 'right', color: '#64748B' }}>
                    {(ask.price * ask.totalQuantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* MID PRICE BANNER */}
            <div className="es-ob-mid-banner">
              <div>
                <span style={{ fontSize: 10, color: '#64748B', display: 'block' }}>MID PRICE</span>
                <span className="es-mid-price">${book.midPrice.toFixed(2)}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 10, color: '#64748B', display: 'block' }}>SPREAD</span>
                <span className="es-spread-txt">${book.spread.toFixed(2)}</span>
              </div>
            </div>

            {/* BUY SIDE (BIDS - Sorted highest to lowest) */}
            <div>
              {book.bids.map((bid) => (
                <div
                  key={`bid-${bid.price}`}
                  className="es-ob-row"
                  onClick={() => { setPrice(bid.price.toFixed(2)); setSide('SELL'); }}
                >
                  <div
                    className="es-depth-fill bid"
                    style={{ width: `${Math.min(100, (bid.totalQuantity / book.maxBidQty) * 100)}%` }}
                  />
                  <span className="es-ob-price bid">${bid.price.toFixed(2)}</span>
                  <span style={{ textAlign: 'right' }}>{bid.totalQuantity}</span>
                  <span style={{ textAlign: 'right', color: '#64748B' }}>
                    {(bid.price * bid.totalQuantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 3: OPEN ORDERS & LIVE TRADE FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Open Orders Management */}
          <div className="es-panel">
            <div className="es-panel-head">
              <span className="es-panel-title">Open Orders Management</span>
              <span style={{ fontSize: 11, color: '#6366F1', fontWeight: 700 }}>
                {openOrders.length} Open
              </span>
            </div>

            <div className="es-table-wrapper">
              <div className="es-table-scroll">
                <table className="es-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Side</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: '16px' }}>
                          No open orders in book.
                        </td>
                      </tr>
                    ) : (
                      openOrders.map((ord) => (
                        <tr key={ord.id}>
                          <td>{ord.id}</td>
                          <td style={{ color: ord.side === 'BUY' ? '#34D399' : '#FCA5A5', fontWeight: 700 }}>
                            {ord.side}
                          </td>
                          <td>${ord.price.toFixed(2)}</td>
                          <td>{ord.remainingQuantity} / {ord.initialQuantity}</td>
                          <td>
                            <span style={{ fontSize: 9, padding: '2px 6px', background: '#1E293B', borderRadius: 4 }}>
                              {ord.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="es-cancel-btn"
                              onClick={() => handleCancelOrder(ord.id)}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Live Executed Trade Feed */}
          <div className="es-panel">
            <div className="es-panel-head">
              <span className="es-panel-title">Live Executed Trade Feed</span>
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>
                {trades.length} Fills
              </span>
            </div>

            <div className="es-table-wrapper">
              <div className="es-table-scroll">
                <table className="es-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Buy ID</th>
                      <th>Sell ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: '16px' }}>
                          No trade executions yet.
                        </td>
                      </tr>
                    ) : (
                      trades.map((trd) => (
                        <tr key={trd.id}>
                          <td style={{ color: '#94A3B8' }}>{trd.timestamp}</td>
                          <td style={{ color: trd.takerSide === 'BUY' ? '#34D399' : '#FCA5A5', fontWeight: 800 }}>
                            ${trd.price.toFixed(2)}
                          </td>
                          <td>{trd.quantity}</td>
                          <td style={{ color: '#818CF8' }}>{trd.buyOrderId}</td>
                          <td style={{ color: '#F472B6' }}>{trd.sellOrderId}</td>
                        </tr>
                      ))
                    )}
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
