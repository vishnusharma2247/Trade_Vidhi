import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import { Bell, Plus, Search } from "lucide-react-native";
import SegmentedControl from "@/components/SegmentedControl";
import AdminRecommendationCard from "@/components/AdminRecommendationCard";
import { api } from "@/lib/api";

type Status = "active" | "pending" | "closed";

const STATUS_SEGMENTS = ["Active", "Pending", "Closed"];
const STATUS_MAP: Status[] = ["active", "pending", "closed"];

export default function AdminDashboard() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [activeSegment, setActiveSegment] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentStatus = STATUS_MAP[activeSegment];

  const fetchRecommendations = useCallback(async () => {
    const token = await getToken();
    const result = await api.get<any[]>(
      `/api/v1/recommendations?status=${currentStatus}`,
      token,
    );

    if (result.success && result.data) {
      setRecommendations(result.data);
    }
  }, [currentStatus, getToken]);

  useEffect(() => {
    setLoading(true);
    fetchRecommendations().finally(() => setLoading(false));
  }, [fetchRecommendations]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  }, [fetchRecommendations]);

  const handleClose = useCallback(
    (id: string) => {
      router.push(`/(admin)/close?id=${id}`);
    },
    [router],
  );

  const filteredRecommendations = searchQuery
    ? recommendations.filter(
        (r) =>
          r.stock?.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.stock?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : recommendations;

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <View className="px-5 pb-3">
        <AdminRecommendationCard
          recommendation={item}
          onEdit={() => {}}
          onClose={handleClose}
        />
      </View>
    ),
    [handleClose],
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-4 pt-2">
        <Text className="text-[22px] font-bold text-foreground">
          Admin Panel
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
        >
          <Bell size={20} strokeWidth={1.5} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* New Recommendation CTA */}
      <View className="px-5 pb-4">
        <TouchableOpacity
          activeOpacity={0.85}
          className="h-[48px] flex-row items-center justify-center gap-2 rounded-full bg-primary"
          onPress={() => router.push("/(admin)/create")}
        >
          <Plus size={18} strokeWidth={2.5} color="#ffffff" />
          <Text className="text-[15px] font-semibold text-white">
            New Recommendation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 pb-4">
        <View className="flex-row items-center rounded-xl bg-surface-muted px-4">
          <Search size={18} strokeWidth={1.5} color="#9b9b9b" />
          <TextInput
            placeholder="Search stocks or tickers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9b9b9b"
            className="ml-3 flex-1 py-3 text-[14px] text-foreground"
          />
        </View>
      </View>

      {/* Segmented Control */}
      <View className="px-5 pb-4">
        <SegmentedControl
          segments={STATUS_SEGMENTS}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />
      </View>

      {/* Recommendations List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F15623" />
        </View>
      ) : (
        <FlatList
          data={filteredRecommendations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32, paddingTop: 4 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#F15623"
            />
          }
          ListEmptyComponent={
            <View className="items-center px-8 pt-16">
              <Text className="text-[16px] font-semibold text-foreground">
                No recommendations
              </Text>
              <Text className="mt-2 text-center text-[13px] text-foreground-muted">
                No {currentStatus} recommendations found.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
