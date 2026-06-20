import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Plus, Eye, FileText, ChevronRight } from "lucide-react-native";
import AppHeader from "@/components/AppHeader";
import PortfolioCard from "@/components/PortfolioCard";
import PortfolioTrendChart from "@/components/PortfolioTrendChart";
import HoldingRow from "@/components/HoldingRow";
import {
  getPortfolioSummary,
  getOpenHoldings,
  getStockById,
  getLivePrice,
} from "@/data/mock";

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const summary = useMemo(() => getPortfolioSummary(), []);
  const holdings = useMemo(() => {
    return getOpenHoldings().map((h) => {
      const stock = getStockById(h.stockId);
      const price = getLivePrice(h.stockId);
      const ltp = price?.ltp ?? h.avgBuyPrice;
      const changePercent = price?.changePercent ?? 0;
      const pnl = (ltp - h.avgBuyPrice) * h.quantity;
      return {
        id: h.id,
        stockId: h.stockId,
        symbol: stock?.symbol ?? "—",
        quantity: h.quantity,
        ltp,
        changePercent,
        pnl: Math.round(pnl),
      };
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <AppHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F15623"
            colors={["#F15623"]}
          />
        }
      >
        {/* Portfolio Hero Card */}
        <View className="px-5 pt-3">
          <PortfolioCard
            currentValue={summary.currentValue}
            totalInvested={summary.totalInvested}
            totalPnl={summary.totalPnl}
            totalPnlPercent={summary.totalPnlPercent}
            todaysPnl={summary.todaysPnl}
          />
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-2 px-5 pt-5">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center gap-[6px] rounded-xl border border-outline bg-surface-elevated px-4 py-[10px]"
            accessibilityRole="button"
            accessibilityLabel="Add Trade"
          >
            <Plus size={14} strokeWidth={2.2} color="#1a1a1a" />
            <Text className="text-[13px] font-semibold text-foreground">
              Add Trade
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/watchlist")}
            className="flex-row items-center gap-[6px] rounded-xl border border-outline bg-surface-elevated px-4 py-[10px]"
            accessibilityRole="button"
            accessibilityLabel="Watchlist"
          >
            <Eye size={14} strokeWidth={1.8} color="#1a1a1a" />
            <Text className="text-[13px] font-semibold text-foreground">
              Watchlist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center gap-[6px] rounded-xl border border-outline bg-surface-elevated px-4 py-[10px]"
            accessibilityRole="button"
            accessibilityLabel="Reports"
          >
            <FileText size={14} strokeWidth={1.8} color="#1a1a1a" />
            <Text className="text-[13px] font-semibold text-foreground">
              Reports
            </Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio Trend Chart */}
        <View className="px-5 pt-5">
          <PortfolioTrendChart currentValue={summary.currentValue} />
        </View>

        {/* Holdings Section */}
        <View className="mt-5 px-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-foreground">
              Holdings
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(tabs)/portfolio")}
              className="flex-row items-center gap-[2px]"
              accessibilityRole="link"
              accessibilityLabel="View all holdings"
            >
              <Text className="text-[13px] font-semibold text-primary">
                View All
              </Text>
              <ChevronRight size={14} strokeWidth={2.2} color="#F15623" />
            </TouchableOpacity>
          </View>

          {/* Holdings list */}
          <View className="mt-2">
            {holdings.slice(0, 4).map((holding, index) => (
              <View key={holding.id}>
                {index > 0 && (
                  <View className="h-[0.5px] bg-outline-subtle" />
                )}
                <HoldingRow
                  symbol={holding.symbol}
                  quantity={holding.quantity}
                  ltp={holding.ltp}
                  changePercent={holding.changePercent}
                  pnl={holding.pnl}
                  onPress={() => router.push(`/holdings/${holding.stockId}`)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
