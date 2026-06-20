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
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { X, Calendar, Building2 } from "lucide-react-native";
import { getStockById, getLivePrice } from "@/data/mock";

interface RecordTradeSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (trade: {
    type: "BUY" | "SELL";
    quantity: number;
    price: number;
    executedAt: string;
  }) => void;
  stockId: string;
  defaultAction?: "BUY" | "SELL";
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getTodayString(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

export default function RecordTradeSheet({
  visible,
  onClose,
  onConfirm,
  stockId,
  defaultAction = "BUY",
}: RecordTradeSheetProps) {
  const stock = useMemo(() => getStockById(stockId), [stockId]);
  const livePrice = useMemo(() => getLivePrice(stockId), [stockId]);

  const [tradeType, setTradeType] = useState<"BUY" | "SELL">(defaultAction);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [executionDate, setExecutionDate] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(700);

  useEffect(() => {
    if (visible) {
      setTradeType(defaultAction);
      setQuantity("");
      setPrice(livePrice?.ltp.toFixed(2) ?? "");
      setExecutionDate(getTodayString());
      backdropOpacity.value = withTiming(1, { duration: 250 });
      sheetTranslateY.value = withSpring(0, { damping: 20, stiffness: 160 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetTranslateY.value = withTiming(700, { duration: 250 });
    }
  }, [visible, livePrice, defaultAction]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const quantityNum = parseInt(quantity) || 0;
  const priceNum = parseFloat(price) || 0;
  const estimatedValue = quantityNum * priceNum;

  const handleConfirm = useCallback(async () => {
    if (quantityNum <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity.");
      return;
    }
    if (priceNum <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price.");
      return;
    }

    setIsSubmitting(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await new Promise((r) => setTimeout(r, 400));
      onConfirm({
        type: tradeType,
        quantity: quantityNum,
        price: priceNum,
        executedAt: new Date().toISOString(),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("Failed to record trade", err);
      Alert.alert("Unable to record trade", message);
    } finally {
      setIsSubmitting(false);
    }
  }, [tradeType, quantityNum, priceNum, onConfirm]);

  const handleClose = useCallback(() => {
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
          <View className="mb-5 items-center">
            <View className="h-[4px] w-10 rounded-full bg-outline" />
          </View>

          {/* Stock Header */}
          <View className="flex-row items-start justify-between">
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-[22px] font-bold tracking-tight text-foreground">
                  {stock.symbol}
                </Text>
                <View className="rounded-md border border-outline px-[7px] py-[2px]">
                  <Text className="text-[11px] font-medium text-foreground-muted">
                    {stock.exchange}
                  </Text>
                </View>
              </View>
              <Text className="mt-[3px] text-[13px] text-foreground-muted">
                LTP: {formatPrice(livePrice?.ltp ?? 0)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-muted"
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <X size={16} strokeWidth={2} color="#6b6b6b" />
            </TouchableOpacity>
          </View>

          {/* BUY / SELL Toggle */}
          <View className="mt-5 flex-row rounded-xl border border-outline">
            <Pressable
              onPress={() => setTradeType("BUY")}
              className={`flex-1 items-center py-[12px] ${
                tradeType === "BUY"
                  ? "border-b-2 border-primary"
                  : "border-b-2 border-transparent"
              }`}
              accessibilityRole="tab"
              accessibilityState={{ selected: tradeType === "BUY" }}
            >
              <Text
                className={`text-[14px] font-semibold ${
                  tradeType === "BUY" ? "text-primary" : "text-foreground-muted"
                }`}
              >
                BUY
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTradeType("SELL")}
              className={`flex-1 items-center py-[12px] ${
                tradeType === "SELL"
                  ? "border-b-2 border-primary"
                  : "border-b-2 border-transparent"
              }`}
              accessibilityRole="tab"
              accessibilityState={{ selected: tradeType === "SELL" }}
            >
              <Text
                className={`text-[14px] font-semibold ${
                  tradeType === "SELL" ? "text-primary" : "text-foreground-muted"
                }`}
              >
                SELL
              </Text>
            </Pressable>
          </View>

          {/* Quantity + Price Row */}
          <View className="mt-5 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-[6px] text-[12px] font-semibold text-primary">
                Quantity
              </Text>
              <View className="rounded-xl border border-outline px-4 py-[12px]">
                <TextInput
                  className="text-[17px] font-semibold text-foreground"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#9b9b9b"
                  accessibilityLabel="Quantity"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="mb-[6px] text-[12px] font-semibold text-primary">
                Price (₹)
              </Text>
              <View className="rounded-xl border border-outline px-4 py-[12px]">
                <TextInput
                  className="text-[17px] font-semibold text-foreground"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#9b9b9b"
                  accessibilityLabel="Price"
                />
              </View>
            </View>
          </View>

          {/* Execution Date */}
          <View className="mt-4">
            <Text className="mb-[6px] text-[12px] font-semibold text-primary">
              Execution Date
            </Text>
            <View className="flex-row items-center rounded-xl border border-outline px-4 py-[12px]">
              <TextInput
                className="flex-1 text-[17px] font-semibold text-foreground"
                value={executionDate}
                onChangeText={setExecutionDate}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#9b9b9b"
                accessibilityLabel="Execution date"
              />
              <Calendar size={18} strokeWidth={1.5} color="#6b6b6b" />
            </View>
          </View>

          {/* Estimated Value */}
          <View className="mt-5 flex-row items-center justify-between border-t border-outline-subtle pt-4">
            <Text className="text-[14px] font-medium text-foreground-muted">
              Estimated Value
            </Text>
            <Text className="text-[24px] font-bold tracking-tight text-foreground">
              {estimatedValue > 0
                ? `₹${estimatedValue.toLocaleString("en-IN")}`
                : "₹0"}
            </Text>
          </View>

          {/* Broker teaser */}
          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Building2 size={14} strokeWidth={1.5} color="#9b9b9b" />
              <Text className="text-[12px] text-foreground-subtle">
                Execute via Broker
              </Text>
            </View>
            <View className="rounded-md bg-surface-muted px-2 py-[2px]">
              <Text className="text-[10px] font-bold tracking-wider text-foreground-subtle">
                COMING SOON
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.88}
            disabled={isSubmitting || quantityNum <= 0 || priceNum <= 0}
            className={`mt-6 h-[54px] items-center justify-center rounded-2xl ${
              isSubmitting || quantityNum <= 0 || priceNum <= 0
                ? "bg-primary/50"
                : "bg-primary"
            }`}
            accessibilityRole="button"
            accessibilityLabel="Confirm trade"
          >
            <Text className="text-[16px] font-bold text-white">
              {isSubmitting ? "Recording..." : "Confirm Trade"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
