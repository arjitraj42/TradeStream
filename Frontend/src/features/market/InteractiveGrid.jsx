import React, { useState, useEffect, useRef } from 'react';
import './InteractiveGrid.css';

export default function InteractiveGrid() {
  const [activeCells, setActiveCells] = useState(new Set());
  const gridRef = useRef(null);

  // Generate grid cells
  const totalCells = 240;

  const handleMouseMove = (e) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colWidth = 56;
    const rowHeight = 56;

    const cols = Math.floor(rect.width / colWidth);
    const col = Math.floor(x / colWidth);
    const row = Math.floor(y / rowHeight);

    const cellIndex = row * cols + col;

    setActiveCells((prev) => {
      const next = new Set(prev);
      next.add(cellIndex);
      // Auto fade out after 600ms
      setTimeout(() => {
        setActiveCells((current) => {
          const updated = new Set(current);
          updated.delete(cellIndex);
          return updated;
        });
      }, 600);
      return next;
    });
  };

  return (
    <div
      className="interactive-grid-wrapper"
      ref={gridRef}
      onMouseMove={handleMouseMove}
    >
      <div className="small-grid-container">
        {Array.from({ length: totalCells }).map((_, index) => {
          const isActive = activeCells.has(index);
          // Random static dark green tiles (like in Image 1)
          const isStaticGreen = (index * 13 + 5) % 37 === 0;

          return (
            <div
              key={index}
              className={`small-grid-cell ${isActive ? 'active-hover' : ''} ${
                isStaticGreen ? 'static-green' : ''
              }`}
            ></div>
          );
        })}
      </div>
    </div>
  );
}
