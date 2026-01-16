"use client";

import React from 'react';
import { Loader2, Play } from 'lucide-react';

interface ShotListDisplayProps {
  shots: { number: number; type: string; description: string }[];
  isLoading: boolean;
}

const ShotListDisplay = ({ shots, isLoading }: ShotListDisplayProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Generating shots...</p>
      </div>
    );
  }

  if (shots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Play className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">No shots generated yet.</p>
        <p className="text-sm">Enter your script and click "Generate Shot List".</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {shots.map((shot) => (
        <div key={shot.number} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
          <span className="font-bold text-primary w-6 flex-shrink-0">{shot.number}.</span>
          <div>
            <span className="font-semibold">{shot.type}</span> - <span className="text-muted-foreground">{shot.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShotListDisplay;