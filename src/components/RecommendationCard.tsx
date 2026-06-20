import { View, Text, TouchableOpacity } from "react-native";
import { ArrowRight, Clock } from "lucide-react-native";
import { getStockById, getLivePrice } from "@/data/mock";

interface Recommendation {
  id: string;
  stockId: string;
  action: "BUY" | "SELL";
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskLevel: string;
  status: string;
  publishedAt: string;
  exitPrice: number | null;
  pnlPercentage: number | null;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPress: (id: string) => void;
}

function getStatusLabel(status: string, stockId: string): { label: string; variant: "success" | "warning" | "neutral" | "error" } {
  const price = getLivePrice(stockId);
  if (!price) return { label: "Active", variant: "neutral" };

  if (status === "target_hit") return { label: "Target Hit", variant: "success" };
  if (status === "sl_hit") return { label: "SL Hit", variant: "error" };
  if (status === "closed") return { label: "Closed", variant: "neutral" };
  if (status === "expired") return { label: "Expired", variant: "neutral" };

  return { label: "Active", variant: "neutral" };
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

const statusColors = {
  success: { bg: "bg-success/10", text: "text-success" },
  warning: { bg: "bg-warning/10", text: "text-warning" },
  neutral: { bg: "bg-primary-subtle", text: "text-primary" },
  error: { bg: "bg-error/10", text: "text-error" },
};

export default function RecommendationCard({
  recommendation,
  onPress,
}: RecommendationCardProps) {
  const stock = getStockById(recommendation.stockId);
  if (!stock) return null;

  const isBuy = recommendation.action === "BUY";
  const accentColor = isBuy ? "#16a34a" : "#dc2626";
  const avatarBg = isBuy ? "bg-success/10" : "bg-error/10";
  const avatarText = isBuy ? "text-success" : "text-error";
  const statusInfo = getStatusLabel(recommendation.status, recommendation.stockId);
  const statusStyle = statusColors[statusInfo.variant];

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(recommendation.id)}
      className="overflow-hidden rounded-2xl bg-surface-elevated"
      accessibilityRole="button"
      accessibilityLabel={`${stock.symbol} ${recommendation.action} recommendation`}
    >
      <View className="flex-row">
        {/* Left accent border */}
        <View
          className="w-[3.5px] rounded-l-2xl"
          style={{ backgroundColor: accentColor }}
        />

        <View className="flex-1 px-4 py-4">
          {/* Top row: Avatar + Stock info + Status badge */}
          <View className="flex-row items-center">
            <View
              className={`h-[42px] w-[42px] items-center justify-center rounded-full ${avatarBg}`}
            >
              <Text className={`text-[16px] font-bold ${avatarText}`}>
                {stock.symbol[0]}
              </Text>
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-[16px] font-bold tracking-tight text-foreground">
                {stock.symbol}
              </Text>
              <View className="mt-[2px] flex-row items-center gap-2">
                <View
                  className={`rounded-[4px] px-[6px] py-[1.5px] ${
                    isBuy ? "bg-success/10" : "bg-error/10"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      isBuy ? "text-success" : "text-error"
                    }`}
                  >
                    {recommendation.action}
                  </Text>
                </View>
                <Text className="text-[12px] text-foreground-muted">
                  {stock.exchange}
                </Text>
              </View>
            </View>

            {/* Status badge */}
            <View className={`rounded-lg px-[10px] py-[4px] ${statusStyle.bg}`}>
              <Text className={`text-[11px] font-semibold ${statusStyle.text}`}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Separator */}
          <View className="my-3 h-[0.5px] bg-outline-subtle" />

          {/* Price row */}
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-[11px] font-medium text-foreground-subtle">
                Entry
              </Text>
              <Text className="mt-[2px] text-[15px] font-semibold text-foreground">
                {formatPrice(recommendation.entryPrice)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-medium text-foreground-subtle">
                Target
              </Text>
              <Text className="mt-[2px] text-[15px] font-semibold text-success">
                {formatPrice(recommendation.targetPrice)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-medium text-foreground-subtle">
                SL
              </Text>
              <Text className="mt-[2px] text-[15px] font-semibold text-error">
                {formatPrice(recommendation.stopLoss)}
              </Text>
            </View>
          </View>

          {/* Separator */}
          <View className="my-3 h-[0.5px] bg-outline-subtle" />

          {/* Bottom row: Time + View Details */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-[5px]">
              <Clock size={13} strokeWidth={1.5} color="#9b9b9b" />
              <Text className="text-[12px] text-foreground-subtle">
                {getTimeAgo(recommendation.publishedAt)}
              </Text>
            </View>

            <View className="flex-row items-center gap-[3px]">
              <Text className="text-[13px] font-medium text-primary">
                View Details
              </Text>
              <ArrowRight size={14} strokeWidth={2} color="#F15623" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
