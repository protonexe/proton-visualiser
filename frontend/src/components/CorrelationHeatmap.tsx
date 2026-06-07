"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { LayoutGrid } from 'lucide-react';

interface CorrelationHeatmapProps {
  correlations: Array<{ x: string; y: string; correlation: number }>;
  numericCols: string[];
}

export default function CorrelationHeatmap({ correlations, numericCols }: CorrelationHeatmapProps) {
  if (!correlations || correlations.length === 0) return null;

  // Build a 2D map for easy lookup
  const matrix: Record<string, Record<string, number>> = {};
  numericCols.forEach(col => {
    matrix[col] = { [col]: 1 }; // Self-correlation is always 1
  });

  correlations.forEach(({ x, y, correlation }) => {
    if (!matrix[x]) matrix[x] = {};
    if (!matrix[y]) matrix[y] = {};
    matrix[x][y] = correlation;
    matrix[y][x] = correlation;
  });

  const getColor = (value: number) => {
    // Map -1 (red) -> 0 (white) -> 1 (blue)
    if (value > 0) {
      const intensity = Math.min(Math.round(value * 100), 100);
      return `rgba(59, 130, 246, ${intensity / 100})`; // Blue
    } else if (value < 0) {
      const intensity = Math.min(Math.round(Math.abs(value) * 100), 100);
      return `rgba(239, 68, 68, ${intensity / 100})`; // Red
    }
    return 'transparent';
  };

  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border border-border space-y-4 animate-slide-up">
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Feature Correlation Matrix</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max p-4">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${numericCols.length}, minmax(80px, 1fr))` }}>
            {/* Header Row */}
            <div className="p-2"></div>
            {numericCols.map(col => (
              <div key={col} className="p-2 text-xs font-bold text-muted-foreground text-center truncate uppercase tracking-tighter">
                {col}
              </div>
            ))}

            {/* Matrix Rows */}
            {numericCols.map(rowCol => (
              <React.Fragment key={rowCol}>
                <div className="p-2 text-xs font-bold text-muted-foreground text-right truncate uppercase tracking-tighter">
                  {rowCol}
                </div>
                {numericCols.map(colCol => {
                  const val = matrix[rowCol]?.[colCol] ?? 0;
                  return (
                    <div 
                      key={`${rowCol}-${colCol}`}
                      className="h-12 w-12 border border-border/30 flex items-center justify-center text-[10px] font-medium transition-all hover:scale-110 cursor-default"
                      style={{ backgroundColor: getColor(val), color: Math.abs(val) > 0.5 ? '#fff' : 'inherit' }}
                      title={`${rowCol} vs ${colCol}: ${val.toFixed(3)}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-sm" /> <span>Strong Negative (-1)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-border rounded-sm" /> <span>No Correlation (0)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-sm" /> <span>Strong Positive (1)</span>
        </div>
      </div>
    </div>
  );
}