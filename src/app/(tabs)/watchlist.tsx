import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WatchlistScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-[28px] font-bold tracking-tight text-foreground">
          Watchlist
        </Text>
        <Text className="mt-1 text-[14px] text-foreground-muted">
          Stocks you're tracking
        </Text>
      </View>
    </SafeAreaView>
  );
}
