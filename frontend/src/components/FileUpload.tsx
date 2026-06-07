"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { AppData } from '@/types';
import { Upload, Loader2, FileSpreadsheet } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: (data: AppData) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadSuccess(response.data);
    } catch (err: unknown) {
      console.error('FileUpload Error:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to upload file');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-all relative ${
        dragActive 
          ? 'border-primary bg-primary/5 scale-[0.99]' 
          : 'border-border bg-card hover:bg-muted/50'
      }`}
    >
      <input
        type="file"
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={handleFileChange}
        disabled={uploading}
        accept=".csv,.json,.xlsx"
      />
      <div className="flex flex-col items-center text-center">
        {uploading ? (
          <div className="p-4 bg-primary/10 rounded-full mb-4 animate-pulse">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="p-4 bg-primary/5 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-10 h-10 text-primary" />
          </div>
        )}
        <h3 className="text-xl font-bold text-foreground">
          {uploading ? 'Analyzing your dataset...' : 'Drag & drop your files here'}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {uploading 
            ? 'We are generating beautiful charts, extracting statistical insights, and training fallback visuals.' 
            : 'or click to browse your local files. Support files like CSV, JSON, and XLSX.'}
        </p>
      </div>
      {error && (
        <div className="mt-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}