import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SlidersHorizontal } from "lucide-react-native";
import AppHeader from "@/components/AppHeader";
import FilterChip from "@/components/FilterChip";
import TransactionRow from "@/components/TransactionRow";
import {
  mockTransactions,
  getStockById,
} from "@/data/mock";

type TypeFilter = "all" | "BUY" | "SELL";

interface TransactionItem {
  id: string;
  stockId: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  totalAmount: number;
  executedAt: string;
}

function getMonthYear(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toUpperCase();
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

export default function PortfolioScreen() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredTransactions = useMemo(() => {
    const all = mockTransactions as TransactionItem[];
    if (typeFilter === "all") return all;
    return all.filter((t) => t.type === typeFilter);
  }, [typeFilter]);

  const sections = useMemo(
    () => groupByMonth(filteredTransactions),
    [filteredTransactions]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const handleFilterPress = useCallback((filter: TypeFilter) => {
    setTypeFilter((current) => (current === filter ? "all" : filter));
  }, []);

  const handleTransactionPress = useCallback(
    (stockId: string) => {
      router.push(`/holdings/${stockId}`);
    },
    [router]
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <AppHeader />

      {/* Title */}
      <View className="px-5 pb-1 pt-3">
        <Text className="text-[26px] font-bold tracking-tight text-foreground">
          Transactions
        </Text>
        <Text className="mt-1 text-[14px] text-foreground-muted">
          Your complete trading history.
        </Text>
      </View>

      {/* Filters */}
      <View className="flex-row items-center gap-2 px-5 pt-4">
        <FilterChip
          label="Filter"
          variant="icon"
          onPress={() => {}}
        />
        <View
          className={`rounded-full px-[14px] py-[7px] ${
            typeFilter === "all" ? "bg-primary" : "bg-surface-elevated border border-outline"
          }`}
        >
          <TouchableOpacity onPress={() => setTypeFilter("all")}>
            <Text
              className={`text-[13px] font-semibold ${
                typeFilter === "all" ? "text-white" : "text-foreground"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
        </View>
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

      {/* Transaction List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View className="px-5 pb-2 pt-5">
            <Text className="text-[11px] font-semibold tracking-wider text-foreground-subtle">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const stock = getStockById(item.stockId);
          return (
            <View className="px-5 pb-2">
              <TransactionRow
                symbol={stock?.symbol ?? "—"}
                date={item.executedAt}
                type={item.type as "BUY" | "SELL"}
                quantity={item.quantity}
                price={item.price}
                totalAmount={item.totalAmount}
                onPress={() => handleTransactionPress(item.stockId)}
              />
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
    </SafeAreaView>
  );
}
