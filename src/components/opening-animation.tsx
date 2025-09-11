"use client";

import { useEffect } from "react";
import { AppLogo } from "./app-logo";

interface OpeningAnimationProps {
  onAnimationEnd: () => void;
}

export default function OpeningAnimation({
  onAnimationEnd,
}: OpeningAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 2500); // Animation duration + delay

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="relative animate-logo-in">
        <div className="flex flex-col items-center gap-4">
          <AppLogo className="w-24 h-24" />
          <h1 className="text-5xl font-bold tracking-tighter text-foreground">
            Next Gen
          </h1>
          <p className="text-muted-foreground">AI-Powered Media Analysis</p>
        </div>
      </div>
    </div>
  );
}
