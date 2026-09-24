import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { TrendingUp, TrendingDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function TradingForm({
  initialPrice = 228.87,
  priceChangePercent = 1.42,
  companyName = 'Apple Inc.',
  symbol = 'AAPL',
  currency = '$',
}) {
  const [side, setSide] = useState('BUY'); // 'BUY' | 'SELL'
  const [orderType, setOrderType] = useState('LIMIT'); // 'LIMIT' | 'MARKET'
  const [price, setPrice] = useState(initialPrice.toString());
  const [quantity, setQuantity] = useState('10');
  
  // Validation, Loading & Feedback States
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Auto-calculate Total
  const numericPrice = orderType === 'MARKET' ? initialPrice : (parseFloat(price) || 0);
  const numericQty = parseInt(quantity, 10) || 0;
  const totalAmount = (numericPrice * numericQty).toFixed(2);

  // Synchronize price whenever initialPrice or symbol changes
  useEffect(() => {
    setPrice(initialPrice.toString());
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [initialPrice, symbol, orderType]);

  // Form Validation logic
  const validate = () => {
    const newErrors = {};

    if (!quantity || isNaN(numericQty) || numericQty <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (orderType === 'LIMIT') {
      const numPrice = parseFloat(price);
      if (!price || isNaN(numPrice) || numPrice <= 0) {
        newErrors.price = 'Price must be greater than 0 for LIMIT orders';
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
    };

    try {
      const response = await orderService.placeOrder(payload);
      setSuccessMessage(`Order placed successfully! (${side} ${numericQty} shares of ${symbol} @ ${currency}${numericPrice})`);
      
      // Auto-clear success message after 5s
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isBuy = side === 'BUY';
  const isUp = priceChangePercent >= 0;

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-indigo-950/20">
      
      {/* 1. Trading Card Header */}
      <div className="flex justify-between items-start pb-5 border-b border-slate-800 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">{companyName}</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
              {symbol}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">Real-time Trading Console</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-extrabold text-white font-mono">
            {currency}{initialPrice.toFixed(2)}
          </div>
          <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{isUp ? '+' : ''}{priceChangePercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* 2. Buy/Sell Toggle Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800/80">
        <button
          type="button"
          onClick={() => { setSide('BUY'); setSuccessMessage(null); setErrorMessage(null); }}
          className={`py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
            isBuy
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          BUY
        </button>
        <button
          type="button"
          onClick={() => { setSide('SELL'); setSuccessMessage(null); setErrorMessage(null); }}
          className={`py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
            !isBuy
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          SELL
        </button>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-400 text-xs font-medium animate-fadeIn">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-400 text-xs font-medium animate-fadeIn">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Order Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Order Type Dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Order Type
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="LIMIT">LIMIT ORDER</option>
            <option value="MARKET">MARKET ORDER</option>
          </select>
        </div>

        {/* Price Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-medium text-slate-400">
              Price ({currency})
            </label>
            {orderType === 'MARKET' && (
              <span className="text-[11px] text-amber-400 font-medium">Market Execution</span>
            )}
          </div>
          <input
            type="number"
            step="0.01"
            value={price}
            disabled={orderType === 'MARKET'}
            onChange={(e) => {
              setPrice(e.target.value);
              if (errors.price) setErrors(prev => ({ ...prev, price: null }));
            }}
            placeholder="0.00"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none transition-colors ${
              orderType === 'MARKET'
                ? 'opacity-60 cursor-not-allowed border-slate-800'
                : errors.price
                ? 'border-rose-500/80 focus:border-rose-500'
                : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {errors.price && (
            <p className="mt-1 text-xs text-rose-400">{errors.price}</p>
          )}
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              if (errors.quantity) setErrors(prev => ({ ...prev, quantity: null }));
            }}
            placeholder="Enter quantity"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none transition-colors ${
              errors.quantity
                ? 'border-rose-500/80 focus:border-rose-500'
                : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-rose-400">{errors.quantity}</p>
          )}
        </div>

        {/* Total Calculation Display */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800/60 rounded-xl flex justify-between items-center my-2">
          <span className="text-xs text-slate-400 font-medium">Estimated Total</span>
          <span className="text-base font-bold text-white font-mono">
            {currency}{totalAmount}
          </span>
        </div>

        {/* 4. Action Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            isBuy
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 active:scale-[0.99]'
              : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950/50 active:scale-[0.99]'
          } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Processing Order...</span>
            </>
          ) : (
            <span>{isBuy ? `Place Buy Order (${symbol})` : `Place Sell Order (${symbol})`}</span>
          )}
        </button>

      </form>
    </div>
  );
}
