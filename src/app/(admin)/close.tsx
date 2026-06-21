import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import { ArrowLeft } from "lucide-react-native";
import { api } from "@/lib/api";

type CloseStatus = "target_hit" | "sl_hit" | "closed" | "expired";

const STATUS_OPTIONS: { value: CloseStatus; label: string }[] = [
  { value: "target_hit", label: "Target Hit" },
  { value: "sl_hit", label: "SL Hit" },
  { value: "closed", label: "Closed" },
  { value: "expired", label: "Expired" },
];

export default function CloseRecommendation() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<CloseStatus>("target_hit");
  const [exitPrice, setExitPrice] = useState("");
  const [exitReason, setExitReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const result = await api.get<any>(`/api/v1/recommendations/${id}`, token);
      if (result.success && result.data) {
        setRecommendation(result.data);
      }
      setLoading(false);
    })();
  }, [id, getToken]);

  const handleSubmit = useCallback(async () => {
    if (!exitPrice) {
      Alert.alert("Missing exit price", "Please enter the exit price.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      const result = await api.patch(
        `/api/v1/recommendations/${id}`,
        {
          status,
          exitPrice: parseFloat(exitPrice),
          exitReason: exitReason || undefined,
        },
        token,
      );

      if (result.success) {
        router.back();
      } else {
        Alert.alert(
          "Unable to close recommendation",
          result.error?.message ?? "Something went wrong.",
        );
      }
    } catch (err) {
      console.error("Close recommendation error", err);
      Alert.alert("Unable to close recommendation", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [id, status, exitPrice, exitReason, getToken, router]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#F15623" />
      </SafeAreaView>
    );
  }

  if (!recommendation) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-[16px] font-semibold text-foreground">
          Recommendation not found
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          className="mt-6 h-[48px] w-full items-center justify-center rounded-full bg-primary"
          onPress={() => router.back()}
        >
          <Text className="text-[15px] font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const entryPrice = parseFloat(recommendation.entryPrice);
  const calculatedPnl = exitPrice
    ? (((parseFloat(exitPrice) - entryPrice) / entryPrice) * 100).toFixed(2)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
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
          Close Recommendation
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recommendation Summary */}
        <View className="mb-6 rounded-xl bg-surface-elevated p-4 shadow-md">
          <View className="flex-row items-center justify-between">
            <Text className="text-[16px] font-bold text-foreground">
              {recommendation.stock?.symbol ?? "Unknown"}
            </Text>
            <View
              className={`rounded-md px-3 py-1 ${
                recommendation.action === "BUY" ? "bg-success/10" : "bg-error/10"
              }`}
            >
              <Text
                className={`text-[12px] font-bold ${
                  recommendation.action === "BUY" ? "text-success" : "text-error"
                }`}
              >
                {recommendation.action}
              </Text>
            </View>
          </View>
          <Text className="mt-1 text-[13px] text-foreground-muted">
            Entry: ₹{entryPrice.toLocaleString("en-IN")} • Target: ₹
            {parseFloat(recommendation.targetPrice).toLocaleString("en-IN")} • SL: ₹
            {parseFloat(recommendation.stopLoss).toLocaleString("en-IN")}
          </Text>
        </View>

        {/* Status Selection */}
        <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
          Close Reason
        </Text>
        <View className="mb-4 flex-row flex-wrap gap-3">
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.7}
              className={`rounded-xl px-4 py-3 ${
                status === opt.value ? "bg-primary-subtle" : "bg-surface-muted"
              }`}
              onPress={() => setStatus(opt.value)}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  status === opt.value ? "text-primary" : "text-foreground-muted"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exit Price */}
        <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
          Exit Price
        </Text>
        <TextInput
          placeholder="0.00"
          value={exitPrice}
          onChangeText={setExitPrice}
          keyboardType="decimal-pad"
          placeholderTextColor="#9b9b9b"
          className="mb-2 rounded-xl bg-surface-muted px-4 py-3 text-[14px] text-foreground"
        />
        {calculatedPnl ? (
          <Text
            className={`mb-4 text-[13px] font-medium ${
              parseFloat(calculatedPnl) >= 0 ? "text-success" : "text-error"
            }`}
          >
            Estimated P&L: {parseFloat(calculatedPnl) >= 0 ? "+" : ""}
            {calculatedPnl}%
          </Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* Exit Reason */}
        <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
          Notes (optional)
        </Text>
        <TextInput
          placeholder="Why are you closing this recommendation?"
          value={exitReason}
          onChangeText={setExitReason}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor="#9b9b9b"
          className="mb-6 rounded-xl bg-surface-muted px-4 py-3 text-[14px] leading-[20px] text-foreground"
          style={{ minHeight: 80 }}
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
              Close Recommendation
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
