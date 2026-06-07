export interface DataSummary {
  columns: string[];
  shape: [number, number];
  dtypes?: Record<string, string>;
  numericColumns?: string[];
  categoricalColumns?: string[];
  datetimeColumns?: string[];
  missingValues?: Record<string, number>;
  stats?: Record<string, { mean?: number; std?: number; min?: number; max?: number; median?: number }>;
}

export type GraphType = 
  | 'bar' 
  | 'line' 
  | 'scatter' 
  | 'pie' 
  | 'area' 
  | 'radar' 
  | 'heatmap' 
  | 'treemap' 
  | 'histogram' 
  | 'box' 
  | 'violin' 
  | 'funnel' 
  | 'waterfall' 
  | 'combo' 
  | 'correlation';

export interface SuggestedGraph {
  type: GraphType;
  x: string;
  y?: string;
  z?: string;
  reason: string;
  config?: Record<string, unknown>;
}

export interface AIAnalysis {
  insights: string[];
  suggested_graphs: SuggestedGraph[];
  correlations?: Array<{ x: string; y: string; correlation: number }>;
  outliers?: Array<{ column: string; indices: number[]; values: number[] }>;
}

export interface AppData {
  summary: DataSummary;
  data: Record<string, string | number | boolean | null>[];
  analysis: AIAnalysis;
  error?: string;
}

export interface FilterState {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'not_contains' | 'between';
  value: string | number | [string | number, string | number];
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'png' | 'pdf';
  filename?: string;
  includeCharts?: boolean;
}