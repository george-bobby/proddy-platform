'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  height?: number;
  showValues?: boolean;
  showLabels?: boolean;
  className?: string;
  animate?: boolean;
  formatValue?: (value: number) => string;
  onBarClick?: (label: string, value: number, index: number) => void;
}

export const BarChart = ({
  data,
  height = 200,
  showValues = true,
  showLabels = true,
  className,
  animate = true,
  formatValue = (value) => value.toString(),
  onBarClick,
}: BarChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-40 bg-muted/20 rounded-md", className)}>
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end space-x-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="relative flex flex-col items-center flex-1 group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onBarClick?.(item.label, item.value, index)}
            >
              <div
                className={cn(
                  "w-full rounded-t-md transition-all duration-300",
                  item.color || "bg-secondary",
                  isHovered ? "opacity-80" : "opacity-100",
                  animate && "animate-in fade-in-50 slide-in-from-bottom-3",
                  onBarClick && "cursor-pointer"
                )}
                style={{
                  height: `${percentage}%`,
                  transitionDelay: animate ? `${index * 50}ms` : '0ms',
                }}
              />

              {showValues && (
                <div
                  className={cn(
                    "absolute -top-6 text-xs font-medium transition-opacity duration-200",
                    isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  {formatValue(item.value)}
                </div>
              )}

              {showLabels && (
                <div className="mt-1 text-xs text-muted-foreground truncate max-w-full px-1">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
