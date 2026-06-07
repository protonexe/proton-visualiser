"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap
} from 'recharts';
import { GraphType } from '@/types';

interface GraphProps {
  type: GraphType;
  data: Record<string, unknown>[];
  xKey: string;
  yKey?: string;
  title: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function GraphContainer({ type, data, xKey, yKey, title }: GraphProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartColors = {
    grid: isDark ? '#1e293b' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
    primary: '#3b82f6',
  };

  const activeYKey = yKey || "";

  const truncateLabel = (label: string) => {
    if (label.length > 12) {
      return `${label.substring(0, 4)}...${label.substring(label.length - 4)}`;
    }
    return label;
  };

  const renderChart = () => {
    if (!data || data.length === 0) return null;

    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey={xKey} stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} />
            <Tooltip 
              contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: chartColors.grid, color: isDark ? '#fff' : '#000' }}
              itemStyle={{ color: isDark ? '#fff' : '#000' }}
            />
            <Legend />
            <Bar dataKey={activeYKey} fill={chartColors.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey={xKey} stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} />
            <Tooltip 
              contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: chartColors.grid, color: isDark ? '#fff' : '#000' }}
              itemStyle={{ color: isDark ? '#fff' : '#000' }}
            />
            <Legend />
            <Line type="monotone" dataKey={activeYKey} stroke={chartColors.primary} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey={xKey} stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} />
            <Tooltip 
              contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: chartColors.grid, color: isDark ? '#fff' : '#000' }}
              itemStyle={{ color: isDark ? '#fff' : '#000' }}
            />
            <Legend />
            <Area type="monotone" dataKey={activeYKey} stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} />
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey={xKey} name={xKey} stroke={chartColors.text} />
            <YAxis dataKey={activeYKey} name={activeYKey} stroke={chartColors.text} />
            <Tooltip 
              contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: chartColors.grid, color: isDark ? '#fff' : '#000' }}
              itemStyle={{ color: isDark ? '#fff' : '#000' }}
            />
            <Legend />
            <Scatter name="Data" data={data} fill={chartColors.primary} />
          </ScatterChart>
        );
      case 'pie':
        const pieData = data.slice(0, 10).map(item => ({ 
          name: String(item[xKey]), 
          displayLabel: truncateLabel(String(item[xKey])),
          value: Number(item[activeYKey]) || 0 
        }));
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="displayLabel"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: chartColors.grid, color: isDark ? '#fff' : '#000' }}
              itemStyle={{ color: isDark ? '#fff' : '#000' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.slice(0, 5)}>
            <PolarGrid stroke={chartColors.grid} />
            <PolarAngleAxis dataKey={xKey} stroke={chartColors.text} />
            <PolarRadiusAxis angle={30} stroke={chartColors.text} />
            <Radar name="Value" dataKey={activeYKey} stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.6} />
            <Tooltip 
              contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: chartColors.grid, color: isDark ? '#fff' : '#000' }}
              itemStyle={{ color: isDark ? '#fff' : '#000' }}
            />
            <Legend />
          </RadarChart>
        );
      case 'treemap':
        const treeData = data.slice(0, 20).map(item => ({
          name: truncateLabel(String(item[xKey])),
          size: Number(item[activeYKey]) || 1,
        }));
        return (
          <Treemap
            data={treeData}
            dataKey="size"
            stroke="#fff"
            fill="#3b82f6"
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Graph type "{type}" not yet implemented.
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border h-[450px] flex flex-col animate-slide-up">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
