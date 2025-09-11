"use client";

import { CheckCircle, History, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Sighting = {
  source: string;
  date?: string;
  context: string;
  isOriginalSource?: boolean;
};

interface ContextualHistoryTimelineProps {
  sightings: Sighting[];
}

export function ContextualHistoryTimeline({ sightings }: ContextualHistoryTimelineProps) {
  const sortedSightings = [...sightings].sort((a, b) => {
    if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-9 top-0 h-full w-0.5 bg-border" />

      <div className="space-y-8">
        {sortedSightings.map((sighting, index) => (
          <div key={index} className="flex items-start">
            <div className="absolute left-9 -translate-x-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background">
                {sighting.isOriginalSource ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                    <History className="h-5 w-5 text-primary" />
                )}
            </div>
            <div className="pl-8 flex-1">
              <div className="flex items-center justify-between">
                <p className={cn(
                    "text-sm font-semibold",
                    sighting.isOriginalSource ? "text-green-500" : "text-foreground"
                )}>
                  {sighting.isOriginalSource ? 'Identified as Original Source' : sighting.source}
                </p>
                {sighting.date && (
                  <time className="text-xs text-muted-foreground">
                    {new Date(sighting.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </time>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{sighting.context}</p>
              {!sighting.isOriginalSource && sighting.source.includes('.') &&
                <p className="mt-1 text-xs text-primary">{sighting.source}</p>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
