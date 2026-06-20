import { useLocalSearchParams, useRouter } from "expo-router";
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import OTPInput from "../../components/OTPInput";

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const contact = (params.contact as string) || "your contact";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fff6f4]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-12">
        <Text className="text-3xl font-extrabold text-center">
          Verify Details
        </Text>
        <Text className="text-center text-sm text-gray-600 mt-2">
          OTP sent to {contact}
        </Text>

        <View className="mt-8">
          <OTPInput
            length={6}
            onComplete={() => {
              // navigate to home immediately after 6 digits
              router.replace("/");
            }}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          className="mt-8 bg-gray-200 h-12 rounded-full items-center justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-lg font-semibold text-gray-700">Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
