import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F15623]">
      <View className="flex-1 items-center justify-center px-7">
        <Text className="text-white text-[48px] font-extrabold text-center leading-[56px]">
          TradeVidhi
          {"\n"}
          expert advisory
        </Text>

        <Text className="text-white/95 text-base leading-6 text-center mt-4 max-w-130">
          Professional stock recommendations for NSE & BSE, carefully curated to
          match your long-term financial goals.
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        className="absolute left-5 right-5 bottom-8 h-16 bg-white rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/signin")}
      >
        <Text className="text-[#F15623] text-lg font-semibold">Next →</Text>
      </TouchableOpacity>
    </View>
  );
}
