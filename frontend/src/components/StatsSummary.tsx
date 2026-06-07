"use client";
import React, { useState } from 'react';
import { DataSummary } from '@/types';
import { Sigma, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';

interface StatsSummaryProps {
  summary: DataSummary;
}

export default function StatsSummary({ summary }: StatsSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!summary || !summary.stats || Object.keys(summary.stats).length === 0) {
    return null;
  }

  const stats = summary.stats;
  const numericCols = Object.keys(stats);

  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border border-border space-y-4 animate-slide-up">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Sigma className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Descriptive Statistics</h2>
        </div>
        <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {numericCols.map(col => {
            const stat = stats[col];
            return (
              <div key={col} className="p-4 bg-muted/50 rounded-xl border border-border/60 hover:border-primary/20 hover:bg-muted/75 transition-all space-y-3">
                <div className="flex items-center gap-1.5 border-b border-border/40 pb-1.5">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm text-foreground truncate" title={col}>{col}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Mean</span>
                    <span className="text-xs font-semibold text-foreground truncate" title={String(stat.mean)}>{stat.mean !== undefined ? stat.mean.toFixed(2) : '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Median</span>
                    <span className="text-xs font-semibold text-foreground truncate" title={String(stat.median)}>{stat.median !== undefined ? stat.median.toFixed(2) : '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Min</span>
                    <span className="text-xs font-semibold text-foreground truncate" title={String(stat.min)}>{stat.min !== undefined ? stat.min.toFixed(2) : '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Max</span>
                    <span className="text-xs font-semibold text-foreground truncate" title={String(stat.max)}>{stat.max !== undefined ? stat.max.toFixed(2) : '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Std Dev</span>
                    <span className="text-xs font-semibold text-foreground truncate" title={String(stat.std)}>{stat.std !== undefined ? stat.std.toFixed(2) : '-'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}