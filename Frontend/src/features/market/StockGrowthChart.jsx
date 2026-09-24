import React, { useState, useRef, useMemo } from 'react';
import './StockGrowthChart.css';

// Generates high-density realistic stock market price trajectory
function generateRealisticMarketData(basePrice = 150.70, timeframe = '1Week') {
  const configs = {
    '1Day': { count: 32, labelPrefix: 'Today', days: ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:00'], volatility: 0.006 },
    '1Week': {
      count: 28,
      dates: [
        { day: 'Mon', num: '15' },
        { day: 'Tue', num: '16' },
        { day: 'Wed', num: '17' },
        { day: 'Thu', num: '18' },
        { day: 'Fri', num: '19' },
        { day: 'Sat', num: '20' },
        { day: 'Sun', num: '21' },
        { day: 'Mon', num: '22' },
      ],
      volatility: 0.045,
    },
    '1Month': { count: 30, dates: Array.from({ length: 8 }, (_, i) => ({ day: `W${i + 1}`, num: `${i * 4 + 1}` })), volatility: 0.08 },
    '3Month': { count: 36, dates: Array.from({ length: 8 }, (_, i) => ({ day: `M${Math.floor(i / 3) + 1}`, num: `W${i + 1}` })), volatility: 0.12 },
    '6Month': { count: 40, dates: Array.from({ length: 8 }, (_, i) => ({ day: `M${i + 1}`, num: `2026` })), volatility: 0.18 },
    '1Year': { count: 50, dates: Array.from({ length: 8 }, (_, i) => ({ day: `Q${(i % 4) + 1}`, num: `'25-'26` })), volatility: 0.25 },
    '5Year': { count: 60, dates: Array.from({ length: 8 }, (_, i) => ({ day: `${2021 + i}`, num: `Yr` })), volatility: 0.45 },
    'All': { count: 64, dates: Array.from({ length: 8 }, (_, i) => ({ day: `${2018 + i}`, num: `All` })), volatility: 0.65 },
  };

  const cfg = configs[timeframe] || configs['1Week'];
  const count = cfg.count;
  const points = [];

  // Seeded natural random walk that mimics real candlestick / line swings
  let current = basePrice * 0.75;
  const targetEnd = basePrice;
  const drift = (targetEnd - current) / count;

  // Realistic market oscillation with momentum & pullbacks
  let momentum = 0;
  for (let i = 0; i < count; i++) {
    momentum = momentum * 0.6 + (Math.random() - 0.48) * (basePrice * cfg.volatility);
    // Add micro-noise
    const microNoise = (Math.random() - 0.5) * (basePrice * 0.015);
    current = Math.max(30, current + drift + momentum + microNoise);

    const progress = i / (count - 1);
    const dateIdx = Math.min(Math.floor(progress * (cfg.dates?.length || 8)), (cfg.dates?.length || 8) - 1);
    const dateObj = cfg.dates ? cfg.dates[dateIdx] : { day: 'Day', num: `${i + 1}` };

    points.push({
      index: i,
      value: parseFloat(current.toFixed(2)),
      day: dateObj.day,
      dateNum: dateObj.num,
      fullDate: `${dateObj.num} Sept on ${10 + (i % 6)}.00`,
    });
  }

  // Force specific high-fidelity points like in user reference image
  points[Math.floor(count * 0.35)].value = 190.70;
  points[count - 1].value = basePrice;

  return { points, dates: cfg.dates || [] };
}

export default function StockGrowthChart({
  companyName = 'Apple inc',
  symbol = 'AAPL',
  price = '$150,70',
  change = '-1,10%',
  isUp = false,
  lastUpdate = '14.30',
  recommendation = 'BUY', // BUY, STRONG BUY, HOLD, SELL
  recommendationScore = '86% Consensus',
}) {
  const [timeframe, setTimeframe] = useState('1Week');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);

  const { points, dates } = useMemo(() => {
    const rawPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 150.7;
    return generateRealisticMarketData(rawPrice, timeframe);
  }, [price, timeframe]);

  // Fixed grid range 0 to 300 (or dynamic based on values)
  const yAxisTicks = [300, 250, 200, 150, 100, 50];
  const minY = 50;
  const maxY = 300;
  const yRange = maxY - minY;

  const svgWidth = 850;
  const svgHeight = 280;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 20;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Map data points to SVG coordinates
  const coords = points.map((p, i) => {
    const x = padLeft + (i / (points.length - 1)) * chartW;
    const clampedVal = Math.min(Math.max(p.value, minY), maxY);
    const y = padTop + chartH - ((clampedVal - minY) / yRange) * chartH;
    return { ...p, x, y };
  });

  // Sharp market polyline path (matching reference image)
  let linePathD = '';
  if (coords.length > 0) {
    linePathD = `M ${coords[0].x},${coords[0].y} `;
    for (let i = 1; i < coords.length; i++) {
      linePathD += `L ${coords[i].x},${coords[i].y} `;
    }
  }

  // Shaded area path
  const areaPathD =
    coords.length > 0
      ? `${linePathD} L ${coords[coords.length - 1].x},${padTop + chartH} L ${coords[0].x},${padTop + chartH} Z`
      : '';

  // Active or Default Hover Point (default to the landmark point ~35% mark like in image)
  const defaultLandmarkIndex = Math.floor(coords.length * 0.35);
  const activeIdx = hoveredIndex !== null ? hoveredIndex : defaultLandmarkIndex;
  const activeCoord = coords[activeIdx] || coords[0];

  // Mouse Move on Chart
  const handleMouseMove = (e) => {
    if (!containerRef.current || coords.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (mouseX - padLeft) / chartW));
    const closestIdx = Math.round(ratio * (coords.length - 1));
    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="stock-chart-card">
      {/* Top Card Header */}
      <div className="chart-card-header">
        <div className="header-left">
          <div className="company-logo-circle">
            <span className="logo-symbol">🍎</span>
          </div>
          <div className="company-titles">
            <div className="name-row">
              <h2>{companyName}</h2>
              <span className="analyst-signal-badge buy">
                {recommendation} • {recommendationScore}
              </span>
            </div>
            <span className="ticker-sub">{symbol}</span>
          </div>
        </div>

        <div className="header-right">
          <div className="price-tag-row">
            <span className={`change-pill ${isUp ? 'green' : 'red'}`}>
              {change} {isUp ? '↑' : '↓'}
            </span>
            <span className="main-price-val">{price}</span>
          </div>
          <span className="update-time">Last update at {lastUpdate}</span>
        </div>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="timeframe-bar">
        {['1Day', '1Week', '1Month', '3Month', '6Month', '1Year', '5Year', 'All'].map((tf) => (
          <button
            key={tf}
            className={`time-pill ${timeframe === tf ? 'active' : ''}`}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
            {tf === 'All' && <span className="pill-icon">📊</span>}
          </button>
        ))}
      </div>

      {/* Main Graph Visualization Area */}
      <div
        className="graph-canvas-wrapper"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="stock-svg">
          <defs>
            {/* Soft teal/green gradient wash beneath line */}
            <linearGradient id="chartFillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yAxisTicks.map((tickVal) => {
            const yPos = padTop + chartH - ((tickVal - minY) / yRange) * chartH;
            return (
              <g key={tickVal} className="grid-row">
                <text x={padLeft - 12} y={yPos + 4} className="y-axis-label">
                  {tickVal}
                </text>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={svgWidth - padRight}
                  y2={yPos}
                  className="grid-line horizontal"
                />
              </g>
            );
          })}

          {/* Vertical Grid Columns (Dates) */}
          {dates.map((d, idx) => {
            const xPos = padLeft + (idx / Math.max(dates.length - 1, 1)) * chartW;
            return (
              <line
                key={idx}
                x1={xPos}
                y1={padTop}
                x2={xPos}
                y2={padTop + chartH}
                className="grid-line vertical"
              />
            );
          })}

          {/* Gradient Shaded Area */}
          {areaPathD && <path d={areaPathD} fill="url(#chartFillGradient)" />}

          {/* Sharp Teal Financial Stock Line */}
          {linePathD && (
            <path
              d={linePathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Active Data Point: Vertical Dashed Line */}
          {activeCoord && (
            <g className="active-marker-group">
              <line
                x1={activeCoord.x}
                y1={padTop}
                x2={activeCoord.x}
                y2={padTop + chartH}
                className="active-dashed-line"
              />
              {/* Outer pulsing ring */}
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="7"
                fill="rgba(16, 185, 129, 0.3)"
              />
              {/* Center point */}
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="4.5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating Dark Tooltip Box */}
        {activeCoord && (
          <div
            className="chart-tooltip-floating"
            style={{
              left: `${(activeCoord.x / svgWidth) * 100}%`,
              top: `${(activeCoord.y / svgHeight) * 100}%`,
            }}
          >
            <span className="tooltip-timestamp">{activeCoord.fullDate}</span>
            <span className="tooltip-price">${activeCoord.value.toFixed(2).replace('.', ',')}</span>
          </div>
        )}
      </div>

      {/* Two-tier Bottom X-Axis Labels (Day abbreviation + Date Number) */}
      <div className="x-axis-footer" style={{ paddingLeft: `${padLeft}px`, paddingRight: `${padRight}px` }}>
        {dates.map((item, idx) => (
          <div key={idx} className="x-axis-col">
            <span className="col-day">{item.day}</span>
            <span className="col-num">{item.num}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
