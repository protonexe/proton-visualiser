"use client";
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import GraphContainer from '@/components/GraphContainer';
import InsightCard from '@/components/InsightCard';
import DataPreview from '@/components/DataPreview';
import ThemeToggle from '@/components/ThemeToggle';
import StatsSummary from '@/components/StatsSummary';
import CorrelationHeatmap from '@/components/CorrelationHeatmap';
import { AppData, GraphType } from '@/types';
import { BarChart3, Settings2, Database, LayoutDashboard, FileText, Download } from 'lucide-react';

export default function Home() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [customGraph, setCustomGraph] = useState<{ type: GraphType, x: string, y: string } | null>(null);
  const [selectedX, setSelectedX] = useState('');
  const [selectedY, setSelectedY] = useState('');
  const [selectedType, setSelectedType] = useState<GraphType>('bar');

  const handleUploadSuccess = (data: AppData) => {
    setAppData(data);
  };

  if (!appData) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="max-w-2xl w-full space-y-8 text-center animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-foreground tracking-tight">
              Proton<span className="text-primary"> Visualiser</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-lg mx-auto">
              Turn your raw data into intelligent visualizations in seconds. AI-powered analysis for smarter decisions.
            </p>
          </div>
          <div className="p-2 bg-card border border-border rounded-2xl shadow-xl">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>CSV</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>JSON</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>XLSX</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (appData.error) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="max-w-2xl w-full space-y-8 text-center animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-destructive">Upload Error</h1>
            <p className="text-muted-foreground text-lg">{appData.error}</p>
          </div>
          <button 
            onClick={() => setAppData(null)} 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 space-y-8">
      <header className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Proton <span className="text-primary">Visualiser</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => setAppData(null)} 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg transition-all hover:shadow-sm"
          >
            Upload New File
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Analysis and AI Insights */}
        <div className="lg:col-span-1 space-y-6 animate-slide-up">
          <section className="p-6 bg-card rounded-xl shadow-sm border border-border space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Data Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-muted-foreground font-medium">Rows</p>
                  <p className="text-2xl font-bold text-foreground">{appData.summary?.shape?.[0] || 0}</p>
                </div>
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-muted-foreground font-medium">Columns</p>
                  <p className="text-2xl font-bold text-foreground">{appData.summary?.shape?.[1] || 0}</p>
                </div>
            </div>
          </section>

          <section className="p-6 bg-card rounded-xl shadow-sm border border-border space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">AI Insights</h2>
              </div>
              <button 
                onClick={() => {
                  const text = `Proton Visualiser Analysis Report\n\nInsights:\n${appData.analysis?.insights?.join('\n')}\n\nSuggested Visuals:\n${appData.analysis?.suggested_graphs?.map(g => `${g.type}: ${g.x} vs ${g.y} - ${g.reason}`).join('\n')}`;
                  const blob = new Blob([text], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'analysis_report.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Download className="w-3 h-3" /> Export
              </button>
            </div>
            <div className="space-y-3">
              {appData.analysis?.insights?.map((insight: string, i: number) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
          </section>

          <section className="p-6 bg-card rounded-xl shadow-sm border border-border space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Custom Analysis</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">X Axis</label>
                <select 
                  className="w-full p-2.5 mt-1 border border-border rounded-lg bg-muted text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={selectedX}
                  onChange={(e) => setSelectedX(e.target.value)}
                >
                  <option value="">Select Column</option>
                  {appData.summary?.columns?.map((col: string) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Y Axis</label>
                <select 
                  className="w-full p-2.5 mt-1 border border-border rounded-lg bg-muted text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={selectedY}
                  onChange={(e) => setSelectedY(e.target.value)}
                >
                  <option value="">Select Column</option>
                  {appData.summary?.columns?.map((col: string) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Graph Type</label>
                <select 
                  className="w-full p-2.5 mt-1 border border-border rounded-lg bg-muted text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as GraphType)}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="pie">Pie Chart</option>
                  <option value="radar">Radar Chart</option>
                  <option value="treemap">Treemap</option>
                </select>
              </div>
              <button 
                onClick={() => setCustomGraph({ type: selectedType, x: selectedX, y: selectedY })}
                disabled={!selectedX || !selectedY}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
              >
                Generate Graph
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Visualizations */}
        <div className="lg:col-span-2 space-y-8 animate-slide-up">
          {appData.summary && <StatsSummary summary={appData.summary} />}
          
          <DataPreview data={appData.data} />
          
          {appData.analysis?.correlations && appData.analysis.correlations.length > 0 && (
            <CorrelationHeatmap 
              correlations={appData.analysis.correlations} 
              numericCols={appData.summary?.numeric_columns || []} 
            />
          )}

          {customGraph && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Custom Visualization</h2>
              </div>
               <GraphContainer 
                type={customGraph.type} 
                data={appData.data} 
                xKey={customGraph.x} 
                yKey={customGraph.y} 
                title={`${customGraph.type.toUpperCase()}: ${customGraph.x} vs ${customGraph.y}`} 
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">AI Recommended Visuals</h2>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appData.analysis?.suggested_graphs?.map((graph, i) => (
                  <GraphContainer 
                    key={i}
                    type={graph.type} 
                    data={appData.data}
                    xKey={graph.x} 
                    yKey={graph.y} 
                    title={graph.reason} 
                  />
                ))}

                {(appData.analysis?.suggested_graphs?.length || 0) === 0 && (
                  <div className="col-span-2 p-12 text-center bg-card rounded-xl border border-border text-muted-foreground">
                    No recommended graphs found for this dataset. Try Custom Analysis.
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </main>
  );
}