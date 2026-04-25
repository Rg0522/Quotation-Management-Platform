import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color: "blue" | "green" | "purple" | "orange" | "red";
  className?: string;
}

const colorMap = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer group",
        `bg-gradient-to-br ${colorMap[color]}`,
        className,
      )}
    >
      {/* Animated background elements */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl group-hover:blur-3xl transition" />
      <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white opacity-5 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur group-hover:bg-opacity-30 transition">
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                trend.direction === "up"
                  ? "bg-green-500 bg-opacity-30 text-green-100"
                  : "bg-red-500 bg-opacity-30 text-red-100",
              )}
            >
              <span>{trend.direction === "up" ? "↑" : "↓"}</span>
              {trend.value}%
            </div>
          )}
        </div>

        <div>
          <p className="text-white text-opacity-90 text-sm font-medium">
            {title}
          </p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-20 group-hover:opacity-40 transition" />
    </div>
  );
};
