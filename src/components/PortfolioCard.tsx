import { View, Text } from "react-native";
import { TrendingUp, TrendingDown } from "lucide-react-native";

interface PortfolioCardProps {
  currentValue: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPercent: number;
  todaysPnl: number;
}

function formatLargeAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PortfolioCard({
  currentValue,
  totalInvested,
  totalPnl,
  totalPnlPercent,
  todaysPnl,
}: PortfolioCardProps) {
  const isPositive = totalPnl >= 0;
  const isTodayPositive = todaysPnl >= 0;

  return (
    <View className="overflow-hidden rounded-2xl bg-primary">
      {/* Gradient overlay - using opacity layers */}
      <View className="absolute inset-0 opacity-20">
        <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20" />
        <View className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-black/10" />
      </View>

      <View className="px-5 pb-5 pt-4">
        {/* Label */}
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
          Current Value
        </Text>

        {/* Big value */}
        <Text className="mt-1 text-[30px] font-bold tracking-tight text-white">
          {formatLargeAmount(currentValue)}
        </Text>

        {/* Invested + Total P&L row */}
        <View className="mt-3 flex-row items-start">
          <View className="flex-1">
            <Text className="text-[11px] font-medium text-white/60">
              Invested
            </Text>
            <Text className="mt-[2px] text-[14px] font-semibold text-white">
              {formatCompact(totalInvested)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-medium text-white/60">
              Total P&L
            </Text>
            <View className="mt-[2px] flex-row items-center gap-[4px]">
              {isPositive ? (
                <TrendingUp size={12} strokeWidth={2} color="#ffffff" />
              ) : (
                <TrendingDown size={12} strokeWidth={2} color="#ffffff" />
              )}
              <Text className="text-[14px] font-semibold text-white">
                {isPositive ? "+" : ""}
                {formatCompact(totalPnl)}
              </Text>
            </View>
            <Text className="text-[11px] font-medium text-white/70">
              ({isPositive ? "+" : ""}
              {totalPnlPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>

        {/* Today's P&L */}
        <View className="mt-3 flex-row items-center justify-between border-t border-white/15 pt-3">
          <Text className="text-[12px] font-medium text-white/60">
            Today's P&L
          </Text>
          <Text
            className={`text-[15px] font-bold ${
              isTodayPositive ? "text-white" : "text-white"
            }`}
          >
            {isTodayPositive ? "+" : ""}
            {formatCompact(todaysPnl)}
          </Text>
        </View>
      </View>
    </View>
  );
}
