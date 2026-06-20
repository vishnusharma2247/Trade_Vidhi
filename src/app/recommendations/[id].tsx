import { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Bell,
  TrendingUp,
  Target,
  ShieldAlert,
  Lightbulb,
  PlusCircle,
} from "lucide-react-native";
import {
  getRecommendationById,
  getStockById,
  getLivePrice,
} from "@/data/mock";
import PriceProgressBar from "@/components/PriceProgressBar";
import RecordTradeSheet from "@/components/RecordTradeSheet";

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: price % 1 !== 0 ? 2 : 0 })}`;
}

function getRiskReward(entry: number, target: number, stopLoss: number, action: string): string {
  if (action === "BUY") {
    const reward = target - entry;
    const risk = entry - stopLoss;
    if (risk <= 0) return "—";
    return `1 : ${(reward / risk).toFixed(1)}`;
  }
  const reward = entry - target;
  const risk = stopLoss - entry;
  if (risk <= 0) return "—";
  return `1 : ${(reward / risk).toFixed(1)}`;
}

function getHorizonLabel(horizon: string | null): string {
  switch (horizon) {
    case "intraday": return "Intraday";
    case "short": return "1 - 3 Weeks";
    case "medium": return "1 - 3 Months";
    case "long": return "3 - 12 Months";
    default: return "Short Term";
  }
}

function extractTags(rationale: string): string[] {
  const tags: string[] = [];
  const lower = rationale.toLowerCase();
  if (lower.includes("breakout") || lower.includes("technical")) tags.push("Technical Breakout");
  if (lower.includes("volume")) tags.push("Volume Spike");
  if (lower.includes("momentum") || lower.includes("rsi")) tags.push("Momentum");
  if (lower.includes("margin") || lower.includes("growth") || lower.includes("revenue")) tags.push("Fundamental");
  if (lower.includes("large") || lower.includes("nifty")) tags.push("Large Cap");
  if (lower.includes("mid cap") || lower.includes("midcap")) tags.push("Mid Cap");
  if (lower.includes("ebitda") || lower.includes("profit")) tags.push("Profitability");
  if (lower.includes("debt") || lower.includes("balance sheet")) tags.push("Debt Reduction");
  if (tags.length === 0) tags.push("Market Research");
  return tags.slice(0, 3);
}

export default function RecommendationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const recommendation = useMemo(() => getRecommendationById(id), [id]);
  const stock = useMemo(
    () => (recommendation ? getStockById(recommendation.stockId) : null),
    [recommendation]
  );
  const livePrice = useMemo(
    () => (recommendation ? getLivePrice(recommendation.stockId) : null),
    [recommendation]
  );

  const handleBack = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, [router]);

  const [sheetVisible, setSheetVisible] = useState(false);

  const handleRecordTrade = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleConfirmTrade = useCallback(
    (trade: { type: "BUY" | "SELL"; quantity: number; price: number; executedAt: string }) => {
      setSheetVisible(false);
      const total = trade.quantity * trade.price;
      Alert.alert(
        "Trade Recorded",
        `${trade.type} ${trade.quantity} shares at ₹${trade.price.toLocaleString("en-IN")} = ₹${total.toLocaleString("en-IN")}`,
      );
    },
    []
  );

  if (!recommendation || !stock) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <Text className="text-[16px] text-foreground-muted">
          Recommendation not found
        </Text>
        <TouchableOpacity onPress={handleBack} className="mt-4">
          <Text className="text-[14px] font-medium text-primary">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isBuy = recommendation.action === "BUY";
  const currentPrice = livePrice?.ltp ?? recommendation.entryPrice;
  const changePercent = livePrice?.changePercent ?? 0;
  const tags = extractTags(recommendation.rationale);
  const riskReward = getRiskReward(
    recommendation.entryPrice,
    recommendation.targetPrice,
    recommendation.stopLoss,
    recommendation.action
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          className="h-9 w-9 items-center justify-center rounded-full"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} strokeWidth={1.8} color="#1a1a1a" />
        </TouchableOpacity>

        <Text className="text-[18px] font-bold tracking-tight text-foreground">
          TradeVidhi
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          className="relative h-9 w-9 items-center justify-center rounded-full"
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Bell size={20} strokeWidth={1.5} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stock Info */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-2">
            <View
              className={`rounded-md px-[8px] py-[3px] ${
                isBuy ? "bg-success/10" : "bg-error/10"
              }`}
            >
              <Text
                className={`text-[12px] font-bold ${
                  isBuy ? "text-success" : "text-error"
                }`}
              >
                {recommendation.action}
              </Text>
            </View>
            <Text className="text-[13px] font-medium text-foreground-muted">
              {stock.exchange} EQ
            </Text>
          </View>

          <Text className="mt-2 text-[28px] font-bold tracking-tight text-foreground">
            {stock.symbol}
          </Text>
          <Text className="mt-[2px] text-[14px] text-foreground-muted">
            {stock.name}
          </Text>
        </View>

        {/* Current Price */}
        <View className="mx-5 mt-5 border-t border-outline-subtle pt-4">
          <View className="flex-row items-center gap-3">
            <View className="rounded-lg border border-outline px-3 py-[5px]">
              <Text className="text-[11px] font-medium text-foreground-muted">
                Current Price
              </Text>
            </View>
            <Text className="text-[26px] font-bold tracking-tight text-foreground">
              {formatPrice(currentPrice)}
            </Text>
            <View
              className={`flex-row items-center gap-[2px] rounded-md px-[6px] py-[3px] ${
                changePercent >= 0 ? "bg-success/10" : "bg-error/10"
              }`}
            >
              <TrendingUp
                size={11}
                strokeWidth={2}
                color={changePercent >= 0 ? "#16a34a" : "#dc2626"}
                style={changePercent < 0 ? { transform: [{ rotateX: "180deg" }] } : undefined}
              />
              <Text
                className={`text-[12px] font-semibold ${
                  changePercent >= 0 ? "text-success" : "text-error"
                }`}
              >
                {changePercent >= 0 ? "+" : ""}
                {changePercent.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Price Targets Grid */}
        <View className="mt-5 px-5">
          <View className="flex-row gap-3">
            {/* Entry Zone */}
            <View className="flex-1 rounded-xl border border-outline-subtle bg-surface-elevated p-3">
              <View className="flex-row items-center gap-[5px]">
                <View className="h-5 w-5 items-center justify-center rounded-full bg-primary-light">
                  <TrendingUp size={11} strokeWidth={2} color="#F15623" />
                </View>
                <Text className="text-[11px] font-medium text-foreground-muted">
                  Entry Zone
                </Text>
              </View>
              <Text className="mt-2 text-[18px] font-bold text-foreground">
                {formatPrice(recommendation.entryPrice)}
              </Text>
            </View>

            {/* Target Price */}
            <View className="flex-1 rounded-xl border border-outline-subtle bg-surface-elevated p-3">
              <View className="flex-row items-center gap-[5px]">
                <View className="h-5 w-5 items-center justify-center rounded-full bg-success/10">
                  <Target size={11} strokeWidth={2} color="#16a34a" />
                </View>
                <Text className="text-[11px] font-medium text-foreground-muted">
                  Target Price
                </Text>
              </View>
              <Text className="mt-2 text-[18px] font-bold text-success">
                {formatPrice(recommendation.targetPrice)}
              </Text>
            </View>
          </View>

          {/* Stop Loss */}
          <View className="mt-3 rounded-xl border border-outline-subtle bg-surface-elevated p-3">
            <View className="flex-row items-center gap-[5px]">
              <View className="h-5 w-5 items-center justify-center rounded-full bg-error/10">
                <ShieldAlert size={11} strokeWidth={2} color="#dc2626" />
              </View>
              <Text className="text-[11px] font-medium text-foreground-muted">
                Stop Loss
              </Text>
            </View>
            <Text className="mt-2 text-[18px] font-bold text-error">
              {formatPrice(recommendation.stopLoss)}
            </Text>
          </View>
        </View>

        {/* Trade Progress Bar */}
        <View className="mx-5 mt-5 rounded-2xl border border-outline-subtle bg-surface-elevated p-4">
          <PriceProgressBar
            entryPrice={recommendation.entryPrice}
            targetPrice={recommendation.targetPrice}
            stopLoss={recommendation.stopLoss}
            currentPrice={currentPrice}
            action={recommendation.action}
          />

          {/* Risk Reward + Timeframe */}
          <View className="mt-4 flex-row border-t border-outline-subtle pt-3">
            <View className="flex-1">
              <Text className="text-[11px] font-medium text-foreground-subtle">
                Risk Reward
              </Text>
              <Text className="mt-[2px] text-[15px] font-bold text-foreground">
                {riskReward}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-medium text-foreground-subtle">
                Timeframe
              </Text>
              <Text className="mt-[2px] text-[15px] font-bold text-foreground">
                {getHorizonLabel(recommendation.horizon)}
              </Text>
            </View>
          </View>
        </View>

        {/* Analysis Rationale */}
        <View className="mx-5 mt-5 rounded-2xl border border-outline-subtle bg-surface-elevated p-4">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-light">
              <Lightbulb size={13} strokeWidth={2} color="#F15623" />
            </View>
            <Text className="text-[15px] font-bold text-foreground">
              Analysis Rationale
            </Text>
          </View>

          <Text className="mt-3 text-[14px] leading-[22px] text-foreground-muted">
            {recommendation.rationale}
          </Text>

          {/* Tags */}
          <View className="mt-4 flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <View
                key={tag}
                className="rounded-lg border border-outline bg-surface-muted px-3 py-[5px]"
              >
                <Text className="text-[12px] font-medium text-foreground-muted">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Risk Disclaimer */}
        <View className="mx-5 mt-4 px-1">
          <Text className="text-[11px] leading-[16px] text-foreground-subtle">
            Investments are subject to market risks. Past performance does not
            guarantee future returns. This is not financial advice.
          </Text>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-surface px-5 pb-8 pt-3">
        <TouchableOpacity
          onPress={handleRecordTrade}
          activeOpacity={0.88}
          className="h-[52px] flex-row items-center justify-center gap-2 rounded-2xl bg-primary shadow-sm"
          accessibilityRole="button"
          accessibilityLabel={`Record ${recommendation.action} trade for ${stock.symbol}`}
        >
          <PlusCircle size={18} strokeWidth={2} color="#ffffff" />
          <Text className="text-[16px] font-semibold text-white">
            Record {recommendation.action === "BUY" ? "Buy" : "Sell"} Trade
          </Text>
        </TouchableOpacity>
      </View>

      {/* Record Trade Bottom Sheet */}
      <RecordTradeSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        onConfirm={handleConfirmTrade}
        stockId={recommendation.stockId}
        defaultAction={recommendation.action as "BUY" | "SELL"}
      />
    </SafeAreaView>
  );
}
