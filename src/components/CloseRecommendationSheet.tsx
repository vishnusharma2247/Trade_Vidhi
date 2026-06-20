import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { X, ArrowRight } from "lucide-react-native";
import { getStockById, getLivePrice } from "@/data/mock";

interface CloseRecommendationSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (exitPrice: number, notes: string) => void;
  recommendation: {
    id: string;
    stockId: string;
    action: string;
    entryPrice: number;
    status: string;
  };
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CloseRecommendationSheet({
  visible,
  onClose,
  onConfirm,
  recommendation,
}: CloseRecommendationSheetProps) {
  const stock = useMemo(
    () => getStockById(recommendation.stockId),
    [recommendation.stockId]
  );
  const livePrice = useMemo(
    () => getLivePrice(recommendation.stockId),
    [recommendation.stockId]
  );

  const [exitPrice, setExitPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(600);

  useEffect(() => {
    if (visible) {
      const ltpValue = livePrice?.ltp ?? recommendation.entryPrice;
      setExitPrice(ltpValue.toFixed(2));
      setNotes("");
      backdropOpacity.value = withTiming(1, { duration: 250 });
      sheetTranslateY.value = withSpring(0, { damping: 20, stiffness: 160 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetTranslateY.value = withTiming(600, { duration: 250 });
    }
  }, [visible, livePrice, recommendation.entryPrice]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const exitPriceNum = parseFloat(exitPrice) || 0;
  const entryPrice = recommendation.entryPrice;
  const isBuy = recommendation.action === "BUY";

  const realizedPnl = isBuy
    ? exitPriceNum - entryPrice
    : entryPrice - exitPriceNum;
  const realizedPnlPercent =
    entryPrice > 0 ? (realizedPnl / entryPrice) * 100 : 0;
  const isProfitable = realizedPnl >= 0;

  const handleConfirm = useCallback(async () => {
    if (!exitPrice || exitPriceNum <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid exit price.");
      return;
    }

    setIsSubmitting(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await new Promise((r) => setTimeout(r, 400));
      onConfirm(exitPriceNum, notes.trim());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("Failed to close recommendation", err);
      Alert.alert("Unable to close recommendation", message);
    } finally {
      setIsSubmitting(false);
    }
  }, [exitPrice, exitPriceNum, notes, onConfirm]);

  const handleCancel = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  }, [onClose]);

  if (!stock) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Backdrop */}
        <Animated.View
          style={backdropStyle}
          className="absolute inset-0 bg-black/40"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={sheetStyle}
          className="mt-auto rounded-t-3xl bg-surface-elevated px-5 pb-8 pt-3"
        >
          {/* Handle */}
          <View className="mb-4 items-center">
            <View className="h-[4px] w-10 rounded-full bg-outline" />
          </View>

          {/* Title Row */}
          <View className="flex-row items-center justify-between">
            <Text className="text-[22px] font-bold tracking-tight text-foreground">
              Close Recommendation
            </Text>
            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.7}
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-muted"
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <X size={16} strokeWidth={2} color="#6b6b6b" />
            </TouchableOpacity>
          </View>

          {/* Stock Info Card */}
          <View className="mt-4 flex-row items-center rounded-xl border border-outline-subtle bg-surface p-3">
            <View className="h-[44px] w-[44px] items-center justify-center rounded-xl bg-surface-muted">
              <Text className="text-[16px] font-bold text-foreground">
                {stock.symbol[0]}
              </Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[16px] font-bold text-foreground">
                {stock.symbol}
              </Text>
              <Text className="mt-[1px] text-[12px] text-foreground-muted">
                {stock.exchange} • Equity
              </Text>
            </View>
            <View className="flex-row items-center gap-[5px] rounded-lg bg-success/10 px-[10px] py-[4px]">
              <View className="h-[6px] w-[6px] rounded-full bg-success" />
              <Text className="text-[11px] font-bold tracking-wide text-success">
                ACTIVE
              </Text>
            </View>
          </View>

          {/* Exit Price Input */}
          <View className="mt-5">
            <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
              Exit Price (₹)
            </Text>
            <View className="flex-row items-center rounded-xl border border-outline bg-surface-elevated px-4">
              <Text className="text-[16px] text-foreground-subtle">₹</Text>
              <TextInput
                className="ml-2 flex-1 py-[14px] text-[18px] font-semibold text-foreground"
                value={exitPrice}
                onChangeText={setExitPrice}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#9b9b9b"
                selectTextOnFocus
                accessibilityLabel="Exit price"
              />
            </View>
            {livePrice && (
              <Text className="mt-[6px] text-[12px] text-foreground-subtle">
                LTP: {formatPrice(livePrice.ltp)}
              </Text>
            )}
          </View>

          {/* Notes Input */}
          <View className="mt-4">
            <Text className="mb-2 text-[13px] font-medium text-foreground-muted">
              Final Notes / Performance Summary
            </Text>
            <TextInput
              className="h-[100px] rounded-xl border border-outline bg-surface-elevated px-4 py-3 text-[14px] leading-5 text-foreground"
              value={notes}
              onChangeText={setNotes}
              placeholder="Explain the rationale for closing this trade..."
              placeholderTextColor="#9b9b9b"
              multiline
              textAlignVertical="top"
              accessibilityLabel="Final notes"
            />
          </View>

          {/* P&L Summary Card */}
          <View className="mt-5 overflow-hidden rounded-xl bg-surface-muted">
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-[13px] font-medium text-foreground-muted">
                Entry Price
              </Text>
              <Text className="text-[14px] font-semibold text-foreground">
                {formatPrice(entryPrice)}
              </Text>
            </View>
            <View className="h-[0.5px] bg-outline-subtle" />
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-[16px] font-bold text-foreground">
                Realized P&L
              </Text>
              <View className="items-end">
                <Text
                  className={`text-[18px] font-bold ${
                    isProfitable ? "text-success" : "text-error"
                  }`}
                >
                  {isProfitable ? "+" : "-"}
                  {formatPrice(Math.abs(realizedPnl))}
                </Text>
                <Text
                  className={`text-[12px] font-semibold ${
                    isProfitable ? "text-success" : "text-error"
                  }`}
                >
                  {isProfitable ? "+" : ""}
                  {realizedPnlPercent.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.88}
            disabled={isSubmitting}
            className={`mt-6 h-[54px] flex-row items-center justify-center gap-2 rounded-2xl ${
              isSubmitting ? "bg-primary/70" : "bg-primary"
            }`}
            accessibilityRole="button"
            accessibilityLabel="Confirm and close recommendation"
          >
            <Text className="text-[16px] font-semibold text-white">
              {isSubmitting ? "Closing..." : "Confirm & Close"}
            </Text>
            {!isSubmitting && (
              <ArrowRight size={18} strokeWidth={2} color="#ffffff" />
            )}
          </TouchableOpacity>

          {/* Cancel Link */}
          <TouchableOpacity
            onPress={handleCancel}
            activeOpacity={0.7}
            className="mt-3 items-center py-2"
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text className="text-[14px] font-medium text-foreground-muted">
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
