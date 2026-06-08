"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { AppData } from '@/types';
import { Trash2, Type, Edit3, Save, AlertCircle, Settings2 } from 'lucide-react';

interface DataWranglerProps {
  session_id: string;
  summary: AppData['summary'];
  onUpdate: (newData: Partial<AppData>) => void;
}

export default function DataWrangler({ session_id, summary, onUpdate }: DataWranglerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState({ old: '', new: '' });
  const [castVal, setCastVal] = useState({ col: '', type: 'float' });
  const [dropCol, setDropCol] = useState('');

  const handleAction = async (endpoint: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`/api/transform/${endpoint}`, {
        session_id,
        ...payload
      });
      onUpdate(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Transformation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border border-border space-y-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-2">
        <Settings2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Data Wrangler</h2>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Rename Section */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <Edit3 className="w-4 h-4" /> Rename Column
          </div>
          <div className="flex gap-2">
            <select 
              className="flex-1 p-2 bg-background border border-border rounded-md text-sm outline-none"
              value={renameVal.old}
              onChange={e => setRenameVal({...renameVal, old: e.target.value})}
            >
              <option value="">Select Column</option>
              {summary.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input 
              type="text" 
              placeholder="New name..." 
              className="flex-1 p-2 bg-background border border-border rounded-md text-sm outline-none"
              value={renameVal.new}
              onChange={e => setRenameVal({...renameVal, new: e.target.value})}
            />
            <button 
              onClick={() => handleAction('rename', { old_name: renameVal.old, new_name: renameVal.new })}
              disabled={loading || !renameVal.old || !renameVal.new}
              className="p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cast Section */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <Type className="w-4 h-4" /> Cast Data Type
          </div>
          <div className="flex gap-2">
            <select 
              className="flex-1 p-2 bg-background border border-border rounded-md text-sm outline-none"
              value={castVal.col}
              onChange={e => setCastVal({...castVal, col: e.target.value})}
            >
              <option value="">Select Column</option>
              {summary.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              className="w-32 p-2 bg-background border border-border rounded-md text-sm outline-none"
              value={castVal.type}
              onChange={e => setCastVal({...castVal, type: e.target.value})}
            >
              <option value="float">Float</option>
              <option value="int">Integer</option>
              <option value="string">String</option>
            </select>
            <button 
              onClick={() => handleAction('cast', { column: castVal.col, type: castVal.type })}
              disabled={loading || !castVal.col}
              className="p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drop Section */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <Trash2 className="w-4 h-4" /> Drop Column
          </div>
          <div className="flex gap-2">
            <select 
              className="flex-1 p-2 bg-background border border-border rounded-md text-sm outline-none"
              value={dropCol}
              onChange={e => setDropCol(e.target.value)}
            >
              <option value="">Select Column</option>
              {summary.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              onClick={() => handleAction('drop', { column: dropCol })}
              disabled={loading || !dropCol}
              className="p-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
