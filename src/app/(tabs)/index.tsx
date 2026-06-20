import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPortfolioSummary } from "@/data/mock";

export default function DashboardScreen() {
  const summary = getPortfolioSummary();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-[28px] font-bold tracking-tight text-foreground">
          Dashboard
        </Text>
        <Text className="mt-1 text-[14px] text-foreground-muted">
          Welcome back, Rahul
        </Text>

        <View className="mt-6 rounded-2xl bg-surface-elevated p-5 shadow-sm">
          <Text className="text-[13px] font-medium text-foreground-muted">
            Portfolio Value
          </Text>
          <Text className="mt-1 text-[32px] font-bold tracking-tight text-foreground">
            {"₹"}{summary.currentValue.toLocaleString("en-IN")}
          </Text>
          <View className="mt-2 flex-row items-center gap-3">
            <Text
              className={`text-[14px] font-semibold ${summary.totalPnl >= 0 ? "text-success" : "text-error"}`}
            >
              {summary.totalPnl >= 0 ? "+" : ""}
              {"₹"}{Math.abs(summary.totalPnl).toLocaleString("en-IN")}
            </Text>
            <Text
              className={`text-[13px] font-medium ${summary.totalPnl >= 0 ? "text-success" : "text-error"}`}
            >
              ({summary.totalPnlPercent >= 0 ? "+" : ""}
              {summary.totalPnlPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
