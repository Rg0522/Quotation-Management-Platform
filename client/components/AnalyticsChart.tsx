import React from "react";
import { cn } from "@/lib/utils";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title?: string;
  data: ChartData[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
  animated?: boolean;
}

export const BarChart = ({
  title,
  data,
  maxValue,
  height = 250,
  showValues = true,
  animated = true,
}: AnalyticsChartProps) => {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  const colors = [
    "#588C3D", // primary green
    "#7CB342", // light green
    "#9CCC65", // lighter green
    "#AED581", // even lighter
  ];

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      )}
      <div
        style={{ height: `${height}px` }}
        className="flex items-flex-end justify-between gap-3"
      >
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;
          const color = item.color || colors[index % colors.length];

          return (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center justify-end gap-2 group"
            >
              <div className="w-full relative flex-1 flex items-flex-end">
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all duration-500 ease-out",
                    "hover:shadow-lg hover:opacity-90 cursor-pointer",
                  )}
                  style={{
                    backgroundColor: color,
                    height: animated ? `${percentage}%` : 0,
                    animation: animated
                      ? `slideUp 0.6s ease-out ${index * 50}ms forwards`
                      : "none",
                  }}
                />
              </div>
              <div className="text-center">
                {showValues && (
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                    {item.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            height: var(--height);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export const LineChart = ({
  title,
  data,
  maxValue,
  height = 200,
  showValues = true,
}: AnalyticsChartProps) => {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  const points = data.length;
  const svgHeight = height;
  const svgWidth = 100; // percentage
  const padding = 10;

  const getX = (index: number) =>
    (index / (points - 1)) * (svgWidth - 2 * padding) + padding;
  const getY = (value: number) =>
    svgHeight - (value / max) * (svgHeight - 2 * padding) - padding;

  const pathD = data
    .map((item, index) => {
      const x = getX(index);
      const y = getY(item.value);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      )}
      <div className="relative" style={{ height: `${svgHeight}px` }}>
        <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val, i) => (
            <line
              key={`grid-${i}`}
              x1="0"
              y1={getY((val / 100) * max)}
              x2={svgWidth}
              y2={getY((val / 100) * max)}
              stroke="#e5e7eb"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

          {/* Line */}
          <path
            d={pathD}
            stroke="#588C3D"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />

          {/* Gradient fill */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "#588C3D", stopOpacity: 0.3 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#588C3D", stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>

          {/* Area under line */}
          <path
            d={
              pathD +
              ` L ${getX(points - 1)} ${svgHeight} L ${getX(0)} ${svgHeight} Z`
            }
            fill="url(#lineGradient)"
          />

          {/* Data points */}
          {data.map((item, index) => (
            <circle
              key={`point-${index}`}
              cx={getX(index)}
              cy={getY(item.value)}
              r="2"
              fill="#588C3D"
              className="hover:r-4 transition-all"
            />
          ))}
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-muted-foreground">
          {data.map((item, index) => (
            <span key={`label-${index}`}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PieChart = ({ title, data }: AnalyticsChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ["#588C3D", "#7CB342", "#9CCC65", "#AED581"];

  let currentAngle = -90;
  const segments = data.map((item, index) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;

    const x1 = 50 + 40 * Math.cos(startRadians);
    const y1 = 50 + 40 * Math.sin(startRadians);
    const x2 = 50 + 40 * Math.cos(endRadians);
    const y2 = 50 + 40 * Math.sin(endRadians);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    currentAngle = endAngle;

    return {
      path,
      color: colors[index % colors.length],
      percentage: ((item.value / total) * 100).toFixed(1),
      label: item.label,
      value: item.value,
    };
  });

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      )}
      <div className="flex items-center gap-6">
        <svg className="w-40 h-40" viewBox="0 0 100 100">
          {segments.map((segment, index) => (
            <g key={`segment-${index}`}>
              <path
                d={segment.path}
                fill={segment.color}
                opacity="0.8"
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
            </g>
          ))}
        </svg>

        <div className="flex-1 space-y-2">
          {segments.map((segment, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-xs text-muted-foreground">
                {segment.label}
              </span>
              <span className="text-xs font-semibold text-foreground ml-auto">
                {segment.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
