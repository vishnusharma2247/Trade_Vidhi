import { useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";
import {
  getStockById,
  getLivePrice,
  mockHoldings,
  mockTransactions,
  mockRecommendations,
} from "@/data/mock";

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(price: number): string {
  return `₹${Math.abs(price).toLocaleString("en-IN")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HoldingDetailScreen() {
  const { stockId } = useLocalSearchParams<{ stockId: string }>();
  const router = useRouter();

  const stock = useMemo(() => getStockById(stockId), [stockId]);
  const livePrice = useMemo(() => getLivePrice(stockId), [stockId]);

  const holding = useMemo(
    () => mockHoldings.find((h) => h.stockId === stockId && h.status === "open"),
    [stockId]
  );

  const stockTransactions = useMemo(
    () =>
      mockTransactions
        .filter((t) => t.stockId === stockId)
        .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()),
    [stockId]
  );

  const linkedRecommendation = useMemo(() => {
    if (!holding?.recommendationId) return null;
    return mockRecommendations.find((r) => r.id === holding.recommendationId);
  }, [holding]);

  const handleBack = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, [router]);

  if (!stock || !holding) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <Text className="text-[16px] text-foreground-muted">
          Holding not found
        </Text>
        <TouchableOpacity onPress={handleBack} className="mt-4">
          <Text className="text-[14px] font-medium text-primary">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ltp = livePrice?.ltp ?? holding.avgBuyPrice;
  const currentValue = holding.quantity * ltp;
  const totalPnl = currentValue - holding.investedAmount;
  const totalPnlPercent =
    holding.investedAmount > 0 ? (totalPnl / holding.investedAmount) * 100 : 0;
  const isPositive = totalPnl >= 0;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          className="h-9 w-9 items-center justify-center rounded-full"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} strokeWidth={1.8} color="#1a1a1a" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-[18px] font-bold tracking-tight text-foreground">
            {stock.symbol}
          </Text>
          <Text className="text-[12px] text-foreground-muted">
            {stock.exchange}
          </Text>
        </View>
        <View className="w-9" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View className="flex-row gap-3 px-5 pt-5">
          <View className="flex-1 rounded-xl border border-outline-subtle bg-surface-elevated p-3">
            <Text className="text-[11px] font-medium text-foreground-muted">
              Holdings
            </Text>
            <Text className="mt-1 text-[20px] font-bold text-foreground">
              {holding.quantity}
            </Text>
          </View>
          <View className="flex-1 rounded-xl border border-outline-subtle bg-surface-elevated p-3">
            <Text className="text-[11px] font-medium text-foreground-muted">
              Avg Buy
            </Text>
            <Text className="mt-1 text-[20px] font-bold text-foreground">
              {formatPrice(holding.avgBuyPrice)}
            </Text>
          </View>
          <View className="flex-1 rounded-xl border border-outline-subtle bg-surface-elevated p-3">
            <Text className="text-[11px] font-medium text-foreground-muted">
              LTP
            </Text>
            <Text className="mt-1 text-[20px] font-bold text-foreground">
              {formatPrice(ltp)}
            </Text>
          </View>
        </View>

        {/* P&L Card */}
        <View className="mx-5 mt-5 overflow-hidden rounded-2xl bg-primary">
          <View className="absolute inset-0 opacity-20">
            <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20" />
            <View className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10" />
          </View>

          <View className="px-5 pb-5 pt-4">
            <Text className="text-[11px] font-semibold text-white/70">
              Total P&L
            </Text>
            <View className="mt-1 flex-row items-center gap-3">
              <Text className="text-[30px] font-bold tracking-tight text-white">
                {isPositive ? "+" : "-"}
                {formatCompact(totalPnl)}
              </Text>
              <View className="rounded-lg bg-white/20 px-[10px] py-[3px]">
                <Text className="text-[13px] font-bold text-white">
                  ({isPositive ? "+" : ""}
                  {totalPnlPercent.toFixed(2)}%)
                </Text>
              </View>
            </View>

            {/* Realized / Unrealized */}
            <View className="mt-4 flex-row border-t border-white/15 pt-3">
              <View className="flex-1">
                <Text className="text-[11px] font-medium text-white/60">
                  Realized
                </Text>
                <Text className="mt-[2px] text-[15px] font-bold text-white">
                  ₹0
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-medium text-white/60">
                  Unrealized
                </Text>
                <Text className="mt-[2px] text-[15px] font-bold text-white">
                  {isPositive ? "+" : "-"}
                  {formatCompact(totalPnl)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Recommendation Link */}
        {linkedRecommendation && linkedRecommendation.status === "active" && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push(`/recommendations/${linkedRecommendation.id}`)
            }
            className="mx-5 mt-5 flex-row items-center rounded-xl border border-outline-subtle bg-surface-elevated p-4"
          >
            <View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-success/10">
              <Lightbulb size={16} strokeWidth={1.8} color="#16a34a" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-semibold text-foreground">
                Active Recommendation
              </Text>
              <Text className="mt-[1px] text-[12px] text-foreground-muted">
                Hold target: {formatPrice(linkedRecommendation.targetPrice)}
              </Text>
            </View>
            <ChevronRight size={18} strokeWidth={1.8} color="#9b9b9b" />
          </TouchableOpacity>
        )}

        {/* Transactions for this stock */}
        <View className="mt-6 px-5">
          <Text className="text-[18px] font-bold text-foreground">
            Transactions
          </Text>

          <View className="mt-3 overflow-hidden rounded-2xl border border-outline-subtle bg-surface-elevated">
            {stockTransactions.map((txn, index) => {
              const isBuy = txn.type === "BUY";
              return (
                <View key={txn.id}>
                  {index > 0 && (
                    <View className="mx-4 h-[0.5px] bg-outline-subtle" />
                  )}
                  <View className="flex-row items-center px-4 py-[14px]">
                    <View
                      className={`h-[36px] w-[36px] items-center justify-center rounded-full ${
                        isBuy ? "bg-success/10" : "bg-error/10"
                      }`}
                    >
                      {isBuy ? (
                        <ArrowDownLeft size={16} strokeWidth={2} color="#16a34a" />
                      ) : (
                        <ArrowUpRight size={16} strokeWidth={2} color="#dc2626" />
                      )}
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-[14px] font-semibold text-foreground">
                        {txn.type}
                      </Text>
                      <Text className="mt-[1px] text-[12px] text-foreground-muted">
                        {formatDate(txn.executedAt)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[14px] font-bold text-foreground">
                        {txn.quantity} Qty
                      </Text>
                      <Text className="mt-[1px] text-[12px] text-foreground-muted">
                        @ {formatPrice(txn.price)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
