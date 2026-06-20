import { View, Text, TouchableOpacity } from "react-native";

interface HoldingRowProps {
  symbol: string;
  quantity: number;
  ltp: number;
  changePercent: number;
  pnl: number;
  onPress?: () => void;
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPnl(amount: number): string {
  const prefix = amount >= 0 ? "+" : "-";
  return `${prefix}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

export default function HoldingRow({
  symbol,
  quantity,
  ltp,
  changePercent,
  pnl,
  onPress,
}: HoldingRowProps) {
  const isPositive = changePercent >= 0;
  const avatarColors: Record<string, { bg: string; text: string }> = {
    R: { bg: "bg-success/10", text: "text-success" },
    H: { bg: "bg-primary-subtle", text: "text-primary" },
    T: { bg: "bg-blue-50", text: "text-blue-600" },
    I: { bg: "bg-purple-50", text: "text-purple-600" },
    B: { bg: "bg-amber-50", text: "text-amber-600" },
    Z: { bg: "bg-pink-50", text: "text-pink-600" },
  };

  const colors = avatarColors[symbol[0]] ?? { bg: "bg-surface-muted", text: "text-foreground" };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center py-[14px]"
      accessibilityRole="button"
      accessibilityLabel={`${symbol} holding`}
    >
      {/* Avatar */}
      <View
        className={`h-[40px] w-[40px] items-center justify-center rounded-full ${colors.bg}`}
      >
        <Text className={`text-[15px] font-bold ${colors.text}`}>
          {symbol[0]}
        </Text>
      </View>

      {/* Stock info */}
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-semibold text-foreground">
          {symbol}
        </Text>
        <Text className="mt-[2px] text-[12px] text-foreground-muted">
          Qty: {quantity} • LTP: {formatPrice(ltp)}
        </Text>
      </View>

      {/* P&L */}
      <View className="items-end">
        <Text
          className={`text-[14px] font-bold ${
            isPositive ? "text-success" : "text-error"
          }`}
        >
          {isPositive ? "+" : ""}
          {changePercent.toFixed(1)}%
        </Text>
        <Text
          className={`mt-[1px] text-[12px] font-medium ${
            isPositive ? "text-success" : "text-error"
          }`}
        >
          {formatPnl(pnl)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
