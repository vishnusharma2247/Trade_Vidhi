import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";
import AppHeader from "@/components/AppHeader";
import SegmentedControl from "@/components/SegmentedControl";
import FilterChip from "@/components/FilterChip";
import {
  mockWatchlistItems,
  mockTransactions,
  getStockById,
  getLivePrice,
} from "@/data/mock";

// ─── Types ──────────────────────────────────────────────────────────────────

interface WatchlistStock {
  id: string;
  stockId: string;
  symbol: string;
  name: string;
  exchange: string;
  ltp: number;
  change: number;
  changePercent: number;
}

interface TransactionItem {
  id: string;
  stockId: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  totalAmount: number;
  executedAt: string;
}

type TypeFilter = "all" | "BUY" | "SELL";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function getMonthYear(dateString: string): string {
  return new Date(dateString)
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    .toUpperCase();
}

function groupByMonth(transactions: TransactionItem[]) {
  const groups: Record<string, TransactionItem[]> = {};
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
  );
  for (const txn of sorted) {
    const key = getMonthYear(txn.executedAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(txn);
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

// ─── Watchlist View ─────────────────────────────────────────────────────────

function WatchlistView() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const watchlistStocks: WatchlistStock[] = useMemo(() => {
    return mockWatchlistItems.map((item) => {
      const stock = getStockById(item.stockId);
      const price = getLivePrice(item.stockId);
      return {
        id: item.id,
        stockId: item.stockId,
        symbol: stock?.symbol ?? "—",
        name: stock?.name ?? "",
        exchange: stock?.exchange ?? "",
        ltp: price?.ltp ?? 0,
        change: price?.change ?? 0,
        changePercent: price?.changePercent ?? 0,
      };
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(({ item }: { item: WatchlistStock }) => {
    const isPositive = item.changePercent >= 0;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-row items-center rounded-2xl bg-surface-elevated px-4 py-[15px]"
        accessibilityRole="button"
        accessibilityLabel={`${item.symbol} stock`}
      >
        <View className="h-[40px] w-[40px] items-center justify-center rounded-full bg-primary-light">
          <Text className="text-[14px] font-bold text-primary">
            {item.symbol[0]}
          </Text>
        </View>

        <View className="ml-3 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-[15px] font-bold text-foreground">
              {item.symbol}
            </Text>
            <Text className="text-[11px] text-foreground-subtle">
              {item.exchange}
            </Text>
          </View>
          <Text className="mt-[2px] text-[12px] text-foreground-muted" numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[15px] font-bold text-foreground">
            {formatPrice(item.ltp)}
          </Text>
          <View className="mt-[2px] flex-row items-center gap-[3px]">
            {isPositive ? (
              <TrendingUp size={11} strokeWidth={2} color="#16a34a" />
            ) : (
              <TrendingDown size={11} strokeWidth={2} color="#dc2626" />
            )}
            <Text
              className={`text-[12px] font-semibold ${
                isPositive ? "text-success" : "text-error"
              }`}
            >
              {isPositive ? "+" : ""}
              {item.changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <FlatList
      data={watchlistStocks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
      ItemSeparatorComponent={() => <View className="h-[8px]" />}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="mb-3">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center gap-2 rounded-xl border border-outline bg-surface-elevated px-4 py-[11px]"
          >
            <Search size={16} strokeWidth={1.8} color="#9b9b9b" />
            <Text className="flex-1 text-[14px] text-foreground-subtle">
              Search stocks...
            </Text>
          </TouchableOpacity>
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[13px] font-medium text-foreground-muted">
              {watchlistStocks.length} stocks
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-row items-center gap-[5px] rounded-lg bg-primary-light px-3 py-[6px]"
            >
              <Plus size={14} strokeWidth={2.2} color="#F15623" />
              <Text className="text-[12px] font-semibold text-primary">
                Add Stock
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View className="items-center px-8 pt-20">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
            <Eye size={24} strokeWidth={1.5} color="#9b9b9b" />
          </View>
          <Text className="mt-4 text-center text-[16px] font-semibold text-foreground">
            Your watchlist is empty
          </Text>
          <Text className="mt-1 text-center text-[14px] leading-5 text-foreground-muted">
            Add stocks you want to track.
          </Text>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#F15623"
          colors={["#F15623"]}
        />
      }
    />
  );
}

// ─── Transactions View ──────────────────────────────────────────────────────

function TransactionsView() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredTransactions = useMemo(() => {
    const all = mockTransactions as TransactionItem[];
    if (typeFilter === "all") return all;
    return all.filter((t) => t.type === typeFilter);
  }, [typeFilter]);

  const sections = useMemo(() => groupByMonth(filteredTransactions), [filteredTransactions]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const handleFilterPress = useCallback((filter: TypeFilter) => {
    setTypeFilter((current) => (current === filter ? "all" : filter));
  }, []);

  return (
    <View className="flex-1">
      {/* Filters */}
      <View className="flex-row items-center gap-2 px-5 pb-2 pt-3">
        <TouchableOpacity
          onPress={() => setTypeFilter("all")}
          className={`rounded-full px-[14px] py-[7px] ${
            typeFilter === "all" ? "bg-primary" : "border border-outline bg-surface-elevated"
          }`}
        >
          <Text
            className={`text-[13px] font-semibold ${
              typeFilter === "all" ? "text-white" : "text-foreground"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>
        <FilterChip
          label="Buy"
          variant="dot"
          dotColor="#16a34a"
          isActive={typeFilter === "BUY"}
          onPress={() => handleFilterPress("BUY")}
        />
        <FilterChip
          label="Sell"
          variant="dot"
          dotColor="#dc2626"
          isActive={typeFilter === "SELL"}
          onPress={() => handleFilterPress("SELL")}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View className="px-5 pb-2 pt-4">
            <Text className="text-[11px] font-semibold tracking-wider text-foreground-subtle">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const stock = getStockById(item.stockId);
          const isBuy = item.type === "BUY";

          return (
            <View className="px-5 pb-2">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/holdings/${item.stockId}`)}
                className="flex-row items-center rounded-xl bg-surface-elevated px-4 py-[14px]"
              >
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
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[15px] font-bold text-foreground">
                      {stock?.symbol ?? "—"}
                    </Text>
                    <Text className="text-[12px] text-foreground-muted">
                      {formatDate(item.executedAt)}
                    </Text>
                  </View>
                  <Text className="mt-[2px] text-[12px] text-foreground-muted">
                    {item.type} • {item.quantity} @ {formatAmount(item.price)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[15px] font-bold text-foreground">
                    {formatAmount(item.totalAmount)}
                  </Text>
                  <Text className="mt-[1px] text-[11px] font-medium text-success">
                    Completed
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F15623"
            colors={["#F15623"]}
          />
        }
        ListEmptyComponent={
          <View className="items-center pt-20">
            <Text className="text-[16px] font-semibold text-foreground">
              No transactions yet
            </Text>
            <Text className="mt-1 text-[14px] text-foreground-muted">
              Your trading history will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function MarketScreen() {
  const [activeSegment, setActiveSegment] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <AppHeader />

      {/* Title */}
      <View className="px-5 pb-1 pt-3">
        <Text className="text-[26px] font-bold tracking-tight text-foreground">
          {activeSegment === 0 ? "Watchlist" : "Transactions"}
        </Text>
        <Text className="mt-1 text-[14px] text-foreground-muted">
          {activeSegment === 0
            ? "Stocks you're tracking"
            : "Your complete trading history"}
        </Text>
      </View>

      {/* Segmented Toggle */}
      <View className="px-5 pt-3 pb-1">
        <SegmentedControl
          segments={["Watchlist", "Transactions"]}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />
      </View>

      {/* Content */}
      {activeSegment === 0 ? <WatchlistView /> : <TransactionsView />}
    </SafeAreaView>
  );
}
