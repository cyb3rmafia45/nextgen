"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

interface TrustScoreGaugeProps {
  score: number;
}

export function TrustScoreGauge({ score }: TrustScoreGaugeProps) {
  const scoreColor =
    score > 75 ? "#22c55e" : score > 40 ? "#facc15" : "#ef4444";
  const data = [{ name: "Trust Score", value: score, fill: scoreColor }];

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
          barSize={20}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl sm:text-5xl font-bold" style={{ color: scoreColor }}>
          {score}
        </span>
        <span className="text-sm text-muted-foreground">Trust Score</span>
      </div>
    </div>
  );
}
