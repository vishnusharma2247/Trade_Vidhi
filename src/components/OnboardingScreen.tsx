import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary">
      <View className="flex-1 justify-end px-6 pb-12">
        <Text className="text-[40px] font-bold leading-[46px] tracking-tight text-white">
          TradeVidhi
        </Text>
        <Text className="mt-1 text-lg font-medium text-white/70">
          Expert Advisory
        </Text>

        <Text className="mt-6 max-w-[300px] text-base leading-6 text-white/80">
          Professional stock recommendations for NSE & BSE, curated to match
          your financial goals.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          className="mb-4 mt-10 h-[56px] items-center justify-center rounded-full bg-white"
          onPress={() => router.push("/signin")}
        >
          <Text className="text-[16px] font-semibold text-primary">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
