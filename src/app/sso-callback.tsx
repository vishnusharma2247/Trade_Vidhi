import { ActivityIndicator, Text, View } from "react-native";
import { colors } from "@/constants/colors";

export default function SsoCallbackScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-6 text-[18px] font-semibold text-foreground">
        Completing sign-in
      </Text>
      <Text className="mt-2 text-center text-[14px] text-foreground-muted">
        Please wait while we finish your authentication.
      </Text>
    </View>
  );
}
