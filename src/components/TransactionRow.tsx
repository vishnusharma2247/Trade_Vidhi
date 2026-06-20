import { View, Text, TouchableOpacity } from "react-native";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";

interface TransactionRowProps {
  symbol: string;
  date: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  totalAmount: number;
  status?: string;
  onPress?: () => void;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function TransactionRow({
  symbol,
  date,
  type,
  quantity,
  price,
  totalAmount,
  status = "Completed",
  onPress,
}: TransactionRowProps) {
  const isBuy = type === "BUY";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center rounded-xl bg-surface-elevated px-4 py-[14px]"
      accessibilityRole="button"
      accessibilityLabel={`${type} ${symbol} transaction`}
    >
      {/* Icon */}
      <View
        className={`h-[40px] w-[40px] items-center justify-center rounded-full ${
          isBuy ? "bg-success/10" : "bg-error/10"
        }`}
      >
        {isBuy ? (
          <ArrowDownLeft size={18} strokeWidth={2} color="#16a34a" />
        ) : (
          <ArrowUpRight size={18} strokeWidth={2} color="#dc2626" />
        )}
      </View>

      {/* Details */}
      <View className="ml-3 flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-[15px] font-bold text-foreground">
            {symbol}
          </Text>
          <Text className="text-[12px] text-foreground-muted">
            {formatDate(date)}
          </Text>
        </View>
        <Text className="mt-[2px] text-[12px] text-foreground-muted">
          {type} • {quantity} @ {formatAmount(price)}
        </Text>
      </View>

      {/* Amount + Status */}
      <View className="items-end">
        <Text className="text-[15px] font-bold text-foreground">
          {formatAmount(totalAmount)}
        </Text>
        <Text className="mt-[1px] text-[11px] font-medium text-success">
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
