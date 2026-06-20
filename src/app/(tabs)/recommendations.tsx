import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Lightbulb } from "lucide-react-native";
import AppHeader from "@/components/AppHeader";
import SegmentedControl from "@/components/SegmentedControl";
import FilterChip from "@/components/FilterChip";
import RecommendationCard from "@/components/RecommendationCard";
import {
  mockRecommendations,
  getActiveRecommendations,
  getClosedRecommendations,
} from "@/data/mock";

type ActionFilter = "all" | "BUY" | "SELL";

export default function RecommendationsScreen() {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState(0);
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const isActive = activeSegment === 0;

  const filteredRecommendations = useMemo(() => {
    const base = isActive
      ? getActiveRecommendations()
      : getClosedRecommendations();

    if (actionFilter === "all") return base;
    return base.filter((r) => r.action === actionFilter);
  }, [isActive, actionFilter]);

  const handleCardPress = useCallback(
    (id: string) => {
      router.push(`/recommendations/${id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const handleFilterPress = useCallback(
    (filter: ActionFilter) => {
      setActionFilter((current) => (current === filter ? "all" : filter));
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof mockRecommendations)[0] }) => (
      <RecommendationCard
        recommendation={item as any}
        onPress={handleCardPress}
      />
    ),
    [handleCardPress]
  );

  const ListEmpty = useCallback(
    () => (
      <View className="flex-1 items-center justify-center px-8 pt-20">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
          <Lightbulb size={24} strokeWidth={1.5} color="#9b9b9b" />
        </View>
        <Text className="mt-4 text-center text-[16px] font-semibold text-foreground">
          No recommendations
        </Text>
        <Text className="mt-1 text-center text-[14px] leading-5 text-foreground-muted">
          {isActive
            ? "New recommendations will appear here when published by our analysts."
            : "Closed recommendations will show up here with their final P&L."}
        </Text>
      </View>
    ),
    [isActive]
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <AppHeader />

      {/* Title */}
      <View className="px-5 pb-1 pt-3">
        <Text className="text-[26px] font-bold tracking-tight text-foreground">
          Recommendations
        </Text>
      </View>

      {/* Segmented Control */}
      <View className="px-5 pt-4">
        <SegmentedControl
          segments={["Active", "Closed"]}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />
      </View>

      {/* Filters */}
      <View className="flex-row items-center gap-2 px-5 pt-4">
        <FilterChip
          label="Buy"
          variant="dot"
          dotColor="#16a34a"
          isActive={actionFilter === "BUY"}
          onPress={() => handleFilterPress("BUY")}
        />
        <FilterChip
          label="Sell"
          variant="dot"
          dotColor="#dc2626"
          isActive={actionFilter === "SELL"}
          onPress={() => handleFilterPress("SELL")}
        />
        <View className="flex-1" />
        <FilterChip
          label="Filters"
          variant="icon"
          onPress={() => {}}
        />
      </View>

      {/* Recommendation List */}
      <FlatList
        data={filteredRecommendations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F15623"
            colors={["#F15623"]}
          />
        }
      />
    </SafeAreaView>
  );
}
