import { View, Text } from "react-native";

interface PriceProgressBarProps {
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  currentPrice: number;
  action: string;
}

function formatCompact(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function PriceProgressBar({
  entryPrice,
  targetPrice,
  stopLoss,
  currentPrice,
  action,
}: PriceProgressBarProps) {
  const isBuy = action === "BUY";

  // Calculate positions on the bar (0% = SL, 100% = Target for BUY)
  const rangeMin = isBuy ? stopLoss : targetPrice;
  const rangeMax = isBuy ? targetPrice : stopLoss;
  const totalRange = rangeMax - rangeMin;

  const clamp = (val: number) => Math.max(0, Math.min(100, val));

  const entryPosition = clamp(((entryPrice - rangeMin) / totalRange) * 100);
  const currentPosition = clamp(((currentPrice - rangeMin) / totalRange) * 100);

  // Determine LTP color based on position relative to entry
  const isProfit = isBuy ? currentPrice >= entryPrice : currentPrice <= entryPrice;

  return (
    <View>
      {/* Top labels: Entry and Target */}
      <View className="mb-1 flex-row justify-between">
        <View>
          <Text className="text-[11px] font-medium text-foreground-muted">
            {isBuy ? "Entry" : "Target"}
          </Text>
          <Text className="text-[13px] font-bold text-foreground">
            {formatCompact(isBuy ? entryPrice : targetPrice)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[11px] font-medium text-success">Target</Text>
          <Text className="text-[13px] font-bold text-success">
            {formatCompact(isBuy ? targetPrice : entryPrice)}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View className="mt-3 mb-2">
        {/* LTP Label */}
        <View style={{ marginLeft: `${Math.max(5, Math.min(85, currentPosition - 8))}%` }}>
          <View className="self-start rounded-md bg-inverse-surface px-[6px] py-[2px]">
            <Text className="text-[10px] font-semibold text-inverse-on-surface">
              LTP: {formatCompact(currentPrice)}
            </Text>
          </View>
          {/* Arrow */}
          <View
            className="ml-3 h-0 w-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-inverse-surface"
          />
        </View>

        {/* The bar */}
        <View className="mt-1 h-[6px] flex-row overflow-hidden rounded-full bg-surface-muted">
          {/* Red zone (SL side) */}
          <View
            className="h-full rounded-l-full bg-error/60"
            style={{ width: `${entryPosition}%` }}
          />
          {/* Green zone (Target side) */}
          <View
            className="h-full rounded-r-full bg-success/60"
            style={{ width: `${100 - entryPosition}%` }}
          />
        </View>

        {/* Current position dot */}
        <View
          className="absolute mt-[2px]"
          style={{
            left: `${currentPosition}%`,
            top: 28,
            marginLeft: -5,
          }}
        >
          <View
            className={`h-[10px] w-[10px] rounded-full border-2 border-white ${
              isProfit ? "bg-success" : "bg-error"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 2,
            }}
          />
        </View>
      </View>

      {/* SL label below */}
      <View className="mt-1 flex-row">
        <View>
          <Text className="text-[11px] font-medium text-error">SL</Text>
          <Text className="text-[13px] font-bold text-error">
            {formatCompact(stopLoss)}
          </Text>
        </View>
      </View>
    </View>
  );
}
