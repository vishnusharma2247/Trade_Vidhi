import { ActivityIndicator, Text, View } from "react-native";

export default function SsoCallbackScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#fff6f4] px-6">
      <ActivityIndicator size="large" color="#F15623" />
      <Text className="mt-5 text-center text-2xl font-bold text-black">
        Completing Google sign-in
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-600">
        Please wait while we finish your authentication.
      </Text>
    </View>
  );
}
