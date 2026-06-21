import { View, Text, TouchableOpacity } from "react-native";
import { Circle } from "lucide-react-native";

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
}

interface Recommendation {
  id: string;
  action: "BUY" | "SELL";
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  status: string;
  publishedAt: string;
  exitPrice: string | null;
  pnlPercentage: string | null;
  closedAt: string | null;
  stock: Stock;
}

interface AdminRecommendationCardProps {
  recommendation: Recommendation;
  onEdit?: (id: string) => void;
  onClose?: (id: string) => void;
}

function formatPrice(value: string): string {
  const num = parseFloat(value);
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getStatusDisplay(status: string) {
  switch (status) {
    case "active":
      return { label: "Active", color: "#16a34a", dotColor: "#16a34a" };
    case "pending":
      return { label: "Pending", color: "#f59e0b", dotColor: "#f59e0b" };
    case "target_hit":
      return { label: "Target Hit", color: "#16a34a", dotColor: "#16a34a" };
    case "sl_hit":
      return { label: "SL Hit", color: "#dc2626", dotColor: "#dc2626" };
    case "closed":
      return { label: "Closed", color: "#6b6b6b", dotColor: "#6b6b6b" };
    case "expired":
      return { label: "Expired", color: "#6b6b6b", dotColor: "#6b6b6b" };
    default:
      return { label: status, color: "#6b6b6b", dotColor: "#6b6b6b" };
  }
}

export default function AdminRecommendationCard({
  recommendation,
  onEdit,
  onClose,
}: AdminRecommendationCardProps) {
  const { stock } = recommendation;
  const isBuy = recommendation.action === "BUY";
  const isActive = recommendation.status === "active";
  const isClosed = ["target_hit", "sl_hit", "closed", "expired"].includes(
    recommendation.status,
  );
  const statusDisplay = getStatusDisplay(recommendation.status);

  return (
    <View className="rounded-2xl bg-surface-elevated p-4">
      {/* Header: Stock name + Action badge */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-foreground">
            {stock.name}
          </Text>
          <Text className="mt-[2px] text-[12px] text-foreground-muted">
            {stock.symbol} • {stock.exchange}
          </Text>
        </View>
        <View
          className={`rounded-md px-3 py-[5px] ${isBuy ? "bg-success/10" : "bg-error/10"}`}
        >
          <Text
            className={`text-[12px] font-bold ${isBuy ? "text-success" : "text-error"}`}
          >
            {recommendation.action}
          </Text>
        </View>
      </View>

      {/* Price row */}
      <View className="mt-4 flex-row">
        <View className="flex-1">
          <Text className="text-[11px] font-medium text-foreground-subtle">
            Entry
          </Text>
          <Text className="mt-[2px] text-[14px] font-semibold text-foreground">
            {formatPrice(recommendation.entryPrice)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[11px] font-medium text-foreground-subtle">
            Target
          </Text>
          <Text className="mt-[2px] text-[14px] font-semibold text-success">
            {formatPrice(recommendation.targetPrice)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[11px] font-medium text-foreground-subtle">
            Stop Loss
          </Text>
          <Text className="mt-[2px] text-[14px] font-semibold text-error">
            {formatPrice(recommendation.stopLoss)}
          </Text>
        </View>
      </View>

      {/* Status + Date row */}
      <View className="mt-4 flex-row items-center justify-between border-t border-outline-subtle pt-3">
        <View className="flex-row items-center gap-[6px]">
          <Circle size={8} fill={statusDisplay.dotColor} color={statusDisplay.dotColor} />
          <Text className="text-[12px] text-foreground-muted">
            {statusDisplay.label} • {formatDate(recommendation.publishedAt)}
          </Text>
        </View>

        {/* Actions */}
        {isActive ? (
          <View className="flex-row items-center gap-4">
            {onEdit ? (
              <TouchableOpacity activeOpacity={0.7} onPress={() => onEdit(recommendation.id)}>
                <Text className="text-[13px] font-semibold text-primary">
                  EDIT
                </Text>
              </TouchableOpacity>
            ) : null}
            {onClose ? (
              <TouchableOpacity activeOpacity={0.7} onPress={() => onClose(recommendation.id)}>
                <Text className="text-[13px] font-semibold text-foreground-muted">
                  CLOSE
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {isClosed && recommendation.pnlPercentage ? (
          <Text
            className={`text-[13px] font-semibold ${
              parseFloat(recommendation.pnlPercentage) >= 0
                ? "text-success"
                : "text-error"
            }`}
          >
            {parseFloat(recommendation.pnlPercentage) >= 0 ? "+" : ""}
            {recommendation.pnlPercentage}%
          </Text>
        ) : null}
      </View>
    </View>
  );
}
