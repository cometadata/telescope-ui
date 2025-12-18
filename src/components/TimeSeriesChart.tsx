"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

interface TimeSeriesChartProps {
  data: { year: number; count: number }[];
  height?: number;
}

const chartColors = {
  light: {
    stroke: "#000000",
    fill: "#e5e7eb",
    grid: "#e5e7eb",
    axis: "#6b7280",
    tooltipBg: "#ffffff",
    tooltipBorder: "#e5e7eb",
    tooltipText: "#111827",
    dotFill: "#ffffff",
    dotStroke: "#000000",
  },
  dark: {
    stroke: "#e2e8f0",
    fill: "#334155",
    grid: "#334155",
    axis: "#94a3b8",
    tooltipBg: "#1e293b",
    tooltipBorder: "#334155",
    tooltipText: "#f1f5f9",
    dotFill: "#1e293b",
    dotStroke: "#e2e8f0",
  },
};

export function TimeSeriesChart({ data, height = 300 }: TimeSeriesChartProps) {
  const { resolvedTheme } = useTheme();
  // Use light theme during SSR to avoid hydration flash
  const colors = chartColors[resolvedTheme ?? "light"];

  // Parent handles loading state - returning null prevents double-flash
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="year"
          stroke={colors.axis}
          tick={{ fill: colors.axis, fontSize: 12 }}
          tickFormatter={(value) => value.toString()}
        />
        <YAxis
          stroke={colors.axis}
          tick={{ fill: colors.axis, fontSize: 12 }}
          tickFormatter={(value) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)},000`;
            }
            return value.toString();
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: "0.375rem",
            color: colors.tooltipText,
          }}
          labelStyle={{ color: colors.tooltipText }}
          itemStyle={{ color: colors.tooltipText }}
          labelFormatter={(label) => `Year: ${label}`}
          formatter={(value) => [(value ?? 0).toLocaleString(), "Records"]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={colors.stroke}
          strokeWidth={2}
          fill={colors.fill}
          dot={{ fill: colors.dotFill, stroke: colors.dotStroke, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: colors.stroke }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
