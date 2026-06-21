import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import { ArrowLeft, Search, X } from "lucide-react-native";
import { api } from "@/lib/api";

type RiskLevel = "low" | "medium" | "high";
type Horizon = "intraday" | "short" | "medium" | "long";
type Action = "BUY" | "SELL";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
}

export default function CreateRecommendation() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stockSearch, setStockSearch] = useState("");
  const [stockResults, setStockResults] = useState<Stock[]>([]);
  const [showStockSearch, setShowStockSearch] = useState(false);
  const [searching, setSearching] = useState(false);

  const [action, setAction] = useState<Action>("BUY");
  const [entryPrice, setEntryPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("medium");
  const [rationale, setRationale] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("short");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchStocks = useCallback(
    async (query: string) => {
      setStockSearch(query);
      if (query.length < 1) {
        setStockResults([]);
        return;
      }
      setSearching(true);
      const token = await getToken();
      const result = await api.get<Stock[]>(
        `/api/v1/stocks/search?q=${encodeURIComponent(query)}`,
        token,
      );
      if (result.success && result.data) {
        setStockResults(result.data);
      }
      setSearching(false);
    },
    [getToken],
  );

  const selectStock = useCallback((stock: Stock) => {
    setSelectedStock(stock);
    setShowStockSearch(false);
    setStockSearch("");
    setStockResults([]);
  }, []);

  const handleSubmit = async () => {
    if (!selectedStock) {
      Alert.alert("Missing stock", "Please select a stock for this recommendation.");
      return;
    }
    if (!entryPrice || !targetPrice || !stopLoss) {
      Alert.alert("Missing prices", "Please fill in entry price, target price, and stop loss.");
      return;
    }
    if (rationale.length < 10) {
      Alert.alert("Rationale too short", "Please provide at least 10 characters of rationale.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      const result = await api.post(
        "/api/v1/recommendations",
        {
          stockId: selectedStock.id,
          action,
          entryPrice: parseFloat(entryPrice),
          targetPrice: parseFloat(targetPrice),
          stopLoss: parseFloat(stopLoss),
          riskLevel,
          rationale,
          horizon,
        },
        token,
      );

      if (result.success) {
        router.back();
      } else {
        Alert.alert(
          "Unable to create recommendation",
          result.error?.message ?? "Something went wrong.",
        );
      }
    } catch (err) {
      console.error("Create recommendation error", err);
      Alert.alert("Unable to create recommendation", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pb-4 pt-2">
          <TouchableOpacity
            activeOpacity={0.7}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} strokeWidth={1.5} color="#1a1a1a" />
          </TouchableOpacity>
          <Text className="text-[20px] font-bold text-foreground">
            New Recommendation
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Stock Selector */}
          <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
            Stock
          </Text>
          {selectedStock ? (
            <View className="mb-4 flex-row items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
              <View>
                <Text className="text-[15px] font-semibold text-foreground">
                  {selectedStock.symbol}
                </Text>
                <Text className="text-[12px] text-foreground-muted">
                  {selectedStock.name} • {selectedStock.exchange}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedStock(null);
                  setShowStockSearch(true);
                }}
              >
                <X size={18} strokeWidth={1.5} color="#6b6b6b" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mb-4">
              <View className="flex-row items-center rounded-xl bg-surface-muted px-4">
                <Search size={16} strokeWidth={1.5} color="#9b9b9b" />
                <TextInput
                  placeholder="Search stock symbol or name..."
                  value={stockSearch}
                  onChangeText={searchStocks}
                  onFocus={() => setShowStockSearch(true)}
                  placeholderTextColor="#9b9b9b"
                  autoCapitalize="characters"
                  className="ml-3 flex-1 py-3 text-[14px] text-foreground"
                />
                {searching ? (
                  <ActivityIndicator size="small" color="#F15623" />
                ) : null}
              </View>
              {showStockSearch && stockResults.length > 0 ? (
                <View className="mt-1 max-h-[200px] rounded-xl bg-surface-elevated shadow-md">
                  <FlatList
                    data={stockResults}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        className="border-b border-outline-subtle px-4 py-3"
                        onPress={() => selectStock(item)}
                      >
                        <Text className="text-[14px] font-semibold text-foreground">
                          {item.symbol}
                        </Text>
                        <Text className="text-[12px] text-foreground-muted">
                          {item.name} • {item.exchange}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              ) : null}
            </View>
          )}

          {/* Action Toggle */}
          <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
            Action
          </Text>
          <View className="mb-4 flex-row gap-3">
            {(["BUY", "SELL"] as const).map((a) => (
              <TouchableOpacity
                key={a}
                activeOpacity={0.7}
                className={`flex-1 items-center rounded-xl py-3 ${
                  action === a
                    ? a === "BUY"
                      ? "bg-success/10"
                      : "bg-error/10"
                    : "bg-surface-muted"
                }`}
                onPress={() => setAction(a)}
              >
                <Text
                  className={`text-[14px] font-bold ${
                    action === a
                      ? a === "BUY"
                        ? "text-success"
                        : "text-error"
                      : "text-foreground-muted"
                  }`}
                >
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Inputs */}
          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
                Entry Price
              </Text>
              <TextInput
                placeholder="0.00"
                value={entryPrice}
                onChangeText={setEntryPrice}
                keyboardType="decimal-pad"
                placeholderTextColor="#9b9b9b"
                className="rounded-xl bg-surface-muted px-4 py-3 text-[14px] text-foreground"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
                Target
              </Text>
              <TextInput
                placeholder="0.00"
                value={targetPrice}
                onChangeText={setTargetPrice}
                keyboardType="decimal-pad"
                placeholderTextColor="#9b9b9b"
                className="rounded-xl bg-surface-muted px-4 py-3 text-[14px] text-foreground"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
                Stop Loss
              </Text>
              <TextInput
                placeholder="0.00"
                value={stopLoss}
                onChangeText={setStopLoss}
                keyboardType="decimal-pad"
                placeholderTextColor="#9b9b9b"
                className="rounded-xl bg-surface-muted px-4 py-3 text-[14px] text-foreground"
              />
            </View>
          </View>

          {/* Risk Level */}
          <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
            Risk Level
          </Text>
          <View className="mb-4 flex-row gap-3">
            {(["low", "medium", "high"] as const).map((r) => (
              <TouchableOpacity
                key={r}
                activeOpacity={0.7}
                className={`flex-1 items-center rounded-xl py-3 ${
                  riskLevel === r ? "bg-primary-subtle" : "bg-surface-muted"
                }`}
                onPress={() => setRiskLevel(r)}
              >
                <Text
                  className={`text-[13px] font-semibold capitalize ${
                    riskLevel === r ? "text-primary" : "text-foreground-muted"
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Horizon */}
          <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
            Horizon
          </Text>
          <View className="mb-4 flex-row gap-2">
            {(["intraday", "short", "medium", "long"] as const).map((h) => (
              <TouchableOpacity
                key={h}
                activeOpacity={0.7}
                className={`flex-1 items-center rounded-xl py-3 ${
                  horizon === h ? "bg-primary-subtle" : "bg-surface-muted"
                }`}
                onPress={() => setHorizon(h)}
              >
                <Text
                  className={`text-[12px] font-semibold capitalize ${
                    horizon === h ? "text-primary" : "text-foreground-muted"
                  }`}
                >
                  {h}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rationale */}
          <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
            Rationale
          </Text>
          <TextInput
            placeholder="Why are you recommending this? (min 10 chars)"
            value={rationale}
            onChangeText={setRationale}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9b9b9b"
            className="mb-6 rounded-xl bg-surface-muted px-4 py-3 text-[14px] leading-[20px] text-foreground"
            style={{ minHeight: 100 }}
          />

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSubmitting}
            className={`h-[52px] items-center justify-center rounded-full bg-primary ${isSubmitting ? "opacity-50" : ""}`}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-[15px] font-semibold text-white">
                Publish Recommendation
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
