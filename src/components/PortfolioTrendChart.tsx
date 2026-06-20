import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { MoreHorizontal } from "lucide-react-native";

interface PortfolioTrendChartProps {
  currentValue: number;
}

const PERIODS = ["1D", "1W", "1M", "6M", "1Y", "ALL"] as const;

const mockChartData: Record<string, number[]> = {
  "1D": [98, 97, 99, 100, 98, 101, 103, 102, 104, 103, 105, 104],
  "1W": [92, 94, 93, 96, 95, 98, 97, 100, 99, 102, 101, 104],
  "1M": [80, 82, 85, 83, 88, 86, 90, 92, 89, 95, 98, 104],
  "6M": [60, 65, 62, 70, 72, 68, 75, 80, 78, 85, 92, 104],
  "1Y": [45, 50, 55, 52, 60, 65, 58, 70, 75, 85, 92, 104],
  ALL: [30, 35, 40, 38, 50, 55, 48, 60, 70, 75, 90, 104],
};

function generatePath(data: number[], width: number, height: number): { line: string; area: string } {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;
  const padding = 8;

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: padding + ((maxVal - val) / range) * (height - padding * 2),
  }));

  let line = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
    const cp1y = points[i - 1].y;
    const cp2x = points[i].x - (points[i].x - points[i - 1].x) / 3;
    const cp2y = points[i].y;
    line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
  }

  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return { line, area };
}

function formatValue(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function PortfolioTrendChart({ currentValue }: PortfolioTrendChartProps) {
  const [activePeriod, setActivePeriod] = useState<(typeof PERIODS)[number]>("1M");

  const chartWidth = 280;
  const chartHeight = 120;
  const data = mockChartData[activePeriod];
  const { line, area } = generatePath(data, chartWidth, chartHeight);

  return (
    <View className="rounded-2xl border border-outline-subtle bg-surface-elevated p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[16px] font-bold text-foreground">
          Portfolio Trend
        </Text>
        <TouchableOpacityLike>
          <MoreHorizontal size={18} strokeWidth={1.5} color="#9b9b9b" />
        </TouchableOpacityLike>
      </View>

      {/* Value label */}
      <View className="mt-4 items-center">
        <View className="rounded-lg bg-inverse-surface px-3 py-[4px]">
          <Text className="text-[12px] font-semibold text-inverse-on-surface">
            {formatValue(currentValue)}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View className="mt-2 items-center">
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#F15623" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#F15623" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path d={area} fill="url(#chartGradient)" />
          <Path
            d={line}
            stroke="#F15623"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Period selector */}
      <View className="mt-3 flex-row items-center justify-between rounded-xl bg-surface-muted p-[3px]">
        {PERIODS.map((period) => (
          <Pressable
            key={period}
            onPress={() => setActivePeriod(period)}
            className={`rounded-lg px-[12px] py-[6px] ${
              activePeriod === period ? "bg-surface-elevated shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-[12px] font-semibold ${
                activePeriod === period
                  ? "text-foreground"
                  : "text-foreground-muted"
              }`}
            >
              {period}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function TouchableOpacityLike({ children }: { children: React.ReactNode }) {
  return (
    <Pressable
      className="h-7 w-7 items-center justify-center rounded-full"
      hitSlop={8}
    >
      {children}
    </Pressable>
  );
}
