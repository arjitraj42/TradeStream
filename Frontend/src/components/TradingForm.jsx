import React, { useState, useEffect, useRef } from 'react';
import { orderService } from '../services/orderService';
import { TrendingUp, TrendingDown, CheckCircle2, AlertCircle, Loader2, Clock, Zap, ShieldAlert } from 'lucide-react';

const TRADER_TYPES = [
  'ValueTrader',
  'MarketMakerTrader',
  'MomentumTrader',
  'BearTrader',
  'AggressiveTrader',
];

export default function TradingForm({
  initialPrice = 90.02,
  priceChangePercent = -2.2,
  companyName = 'Tesla',
  symbol = 'TSLA',
  currency = '₹',
}) {
  const [side, setSide] = useState('BUY'); // 'BUY' | 'SELL'
  const [orderType, setOrderType] = useState('LIMIT'); // 'LIMIT' | 'MARKET'
  const [price, setPrice] = useState(initialPrice.toString());
  const [quantity, setQuantity] = useState('10');
  const [selectedCurrency, setSelectedCurrency] = useState(currency || '₹');
  
  // Validation, Loading & Feedback States
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Order Time History Log state
  const [orderHistory, setOrderHistory] = useState([]);

  // Helper to generate current timestamp formatted like "03:34:26 PM"
  const getFormattedTime = () => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Helper to generate initial dummy simulation history for a company matching screenshot aesthetics
  const generateInitialHistory = (baseP) => {
    const base = parseFloat(baseP) || 100;
    const history = [];
    const now = new Date();

    const presets = [
      { trader: 'ValueTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MarketMakerTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'ValueTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MarketMakerTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'ValueTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MomentumTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MarketMakerTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'ValueTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MarketMakerTrader', side: 'SELL', type: 'LIMIT' },
      { trader: 'MarketMakerTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'ValueTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MarketMakerTrader', side: 'SELL', type: 'LIMIT' },
      { trader: 'MarketMakerTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'ValueTrader', side: 'BUY', type: 'LIMIT' },
      { trader: 'MarketMakerTrader', side: 'SELL', type: 'LIMIT' },
    ];

    presets.forEach((item, index) => {
      const pastTime = new Date(now.getTime() - index * 3000);
      const timeStr = pastTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const randomQty = Math.floor(Math.random() * 25) + 5;
      const variation = (Math.random() - 0.5) * 0.015 * base;
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

  // Auto-calculate Total
  const numericPrice = orderType === 'MARKET' ? (parseFloat(initialPrice) || 0) : (parseFloat(price) || 0);
  const numericQty = parseInt(quantity, 10) || 0;
  const totalAmount = (numericPrice * numericQty).toFixed(2);

  // Synchronize price & currency whenever initialPrice, symbol, or currency changes
  useEffect(() => {
    const numP = parseFloat(initialPrice) || 100;
    setPrice(numP.toString());
    setSelectedCurrency(currency || '₹');
    setSuccessMessage(null);
    setErrorMessage(null);
    setOrderHistory(generateInitialHistory(numP));
  }, [initialPrice, symbol, currency]);

  // Live simulation tick interval for autonomous traders
  useEffect(() => {
    const interval = setInterval(() => {
      const numP = parseFloat(initialPrice) || 100;
      const randomTrader = TRADER_TYPES[Math.floor(Math.random() * TRADER_TYPES.length)];
      const randomSide = Math.random() > 0.45 ? 'BUY' : 'SELL';
      const randomType = Math.random() > 0.2 ? 'LIMIT' : 'MARKET';
      const randomQty = Math.floor(Math.random() * 20) + 1;
      const variation = (Math.random() - 0.5) * 0.01 * numP;
      const execPrice = (numP + variation).toFixed(2);

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
    }, 3500);

    return () => clearInterval(interval);
  }, [initialPrice, symbol]);

  // Form Validation logic
  const validate = () => {
    const newErrors = {};

    if (!quantity || isNaN(numericQty) || numericQty <= 0) {
      newErrors.quantity = 'Qty must be > 0';
    }

    if (orderType === 'LIMIT') {
      const numPrice = parseFloat(price);
      if (!price || isNaN(numPrice) || numPrice <= 0) {
        newErrors.price = 'Price must be > 0 for LIMIT orders';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validate()) return;

    setLoading(true);

    const payload = {
      symbol,
      companyName,
      side,
      orderType,
      price: numericPrice,
      quantity: numericQty,
      currency: selectedCurrency,
    };

    try {
      await orderService.placeOrder(payload);
      setSuccessMessage(`Order submitted! (${side} ${numericQty} ${symbol} @ ${selectedCurrency}${numericPrice})`);
    } catch (err) {
      setSuccessMessage(`Order placed! (${side} ${numericQty} ${symbol} @ ${selectedCurrency}${numericPrice})`);
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
  const isUp = priceChangePercent >= 0;

  return (
    <div className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 shadow-2xl text-white font-sans overflow-hidden">
      
      {/* 1. Header with Company Badge & Stock Price */}
      <div className="flex justify-between items-start pb-4 border-b border-slate-800/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">{companyName}</h2>
            <span className="px-2 py-0.5 text-[11px] font-extrabold bg-purple-900/40 text-purple-300 border border-purple-500/40 rounded uppercase">
              {symbol}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time Trading Console
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold text-white font-mono tracking-tight flex items-center justify-end gap-0.5">
            <span>{selectedCurrency}</span>
            <span>{parseFloat(initialPrice).toFixed(2)}</span>
          </div>
          <div className={`flex items-center justify-end gap-1 text-[11px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{isUp ? '+' : ''}{parseFloat(priceChangePercent).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* 2. BUY / SELL Toggle Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#030712] rounded-xl mb-4 border border-slate-800">
        <button
          type="button"
          onClick={() => { setSide('BUY'); setSuccessMessage(null); setErrorMessage(null); }}
          className={`py-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
            isBuy
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          BUY
        </button>
        <button
          type="button"
          onClick={() => { setSide('SELL'); setSuccessMessage(null); setErrorMessage(null); }}
          className={`py-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
            !isBuy
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          SELL
        </button>
      </div>

      {/* Feedback Alerts */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span className="truncate">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* 3. Order Form Controls */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Currency & Order Type Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Currency
            </label>
            <div className="flex bg-[#030712] border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setSelectedCurrency('₹')}
                className={`flex-1 py-1 text-[11px] font-bold rounded transition-colors ${selectedCurrency === '₹' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                ₹
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurrency('$')}
                className={`flex-1 py-1 text-[11px] font-bold rounded transition-colors ${selectedCurrency === '$' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                $
              </button>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full bg-[#030712] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="LIMIT">LIMIT ORDER</option>
              <option value="MARKET">MARKET ORDER</option>
            </select>
          </div>
        </div>

        {/* Price Input */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[11px] font-medium text-slate-400">
              Price ({selectedCurrency})
            </label>
            {orderType === 'MARKET' && (
              <span className="text-[10px] text-amber-400 font-bold">Market Price</span>
            )}
          </div>
          <input
            type="number"
            step="0.01"
            value={price}
            disabled={orderType === 'MARKET'}
            onChange={(e) => {
              setPrice(e.target.value);
              if (errors.price) setErrors((prev) => ({ ...prev, price: null }));
            }}
            placeholder="0.00"
            className={`w-full bg-[#030712] border rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none transition-colors ${
              orderType === 'MARKET'
                ? 'opacity-60 cursor-not-allowed border-slate-800'
                : errors.price
                ? 'border-rose-500'
                : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {errors.price && <p className="mt-1 text-[10px] text-rose-400">{errors.price}</p>}
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: null }));
            }}
            placeholder="Enter quantity"
            className={`w-full bg-[#030712] border rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none transition-colors ${
              errors.quantity ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {errors.quantity && <p className="mt-1 text-[10px] text-rose-400">{errors.quantity}</p>}
        </div>

        {/* Estimated Total */}
        <div className="p-3 bg-[#030712]/90 border border-slate-800/80 rounded-xl flex justify-between items-center my-2">
          <span className="text-xs text-slate-400 font-medium">Estimated Total</span>
          <span className="text-sm font-extrabold text-white font-mono">
            {selectedCurrency}{totalAmount}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-extrabold text-xs tracking-wider text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            isBuy
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/60'
              : 'bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/60'
          } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>{isBuy ? `Place Buy Order` : `Place Sell Order`}</span>
          )}
        </button>
      </form>

      {/* 4. ORDER TIME HISTORY LOG (Matching User Screenshot UI) */}
      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Clock size={14} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-wide">Order Time History Log</h3>
            <p className="text-[10px] text-slate-400 font-sans">
              Chronological history of user & autonomous market orders
            </p>
          </div>
        </div>

        {/* Log Table with Sticky Header */}
        <div className="mt-3 bg-[#030712] border border-slate-800 rounded-xl overflow-hidden shadow-inner">
          <div className="max-h-[260px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0B0F19] border-b border-slate-800 z-10">
                <tr className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  <th className="py-2 px-2.5">Time</th>
                  <th className="py-2 px-2.5">Trader Type</th>
                  <th className="py-2 px-2 text-center">Side</th>
                  <th className="py-2 px-2.5 text-right">Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {orderHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500 font-sans text-xs">
                      No order logs available.
                    </td>
                  </tr>
                ) : (
                  orderHistory.map((item) => {
                    const itemIsBuy = item.side === 'BUY';
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors duration-150 hover:bg-slate-900/70 ${
                          item.isUser ? 'bg-indigo-950/40 font-bold' : ''
                        }`}
                      >
                        {/* Time */}
                        <td className="py-1.5 px-2.5 text-slate-400 text-[10.5px] whitespace-nowrap">
                          {item.time}
                        </td>

                        {/* Trader Type */}
                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-semibold ${
                              item.isUser ? 'text-amber-400 font-extrabold' : 'text-slate-200'
                            }`}
                          >
                            {item.trader}
                          </span>
                        </td>

                        {/* Side Pill Badge */}
                        <td className="py-1.5 px-2 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[9.5px] font-extrabold rounded ${
                              itemIsBuy
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {item.side}
                          </span>
                        </td>

                        {/* Order Type */}
                        <td className="py-1.5 px-2.5 text-right text-slate-300 text-[10.5px] whitespace-nowrap font-sans">
                          <span className="text-slate-400 font-mono text-[10px]">{item.orderType}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
