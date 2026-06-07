"use client";
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface InsightCardProps {
  insight: string;
}

export default function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg flex items-start gap-3 transition-all hover:bg-primary/10">
      <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
      <p className="text-foreground/90 text-sm leading-relaxed">{insight}</p>
    </div>
  );
}