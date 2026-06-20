import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AuthCard from "../../components/AuthCard";

export default function SignIn() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fff6f4]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-12">
        <Text className="text-4xl font-extrabold text-center">
          Welcome to TradeVidhi
        </Text>
        <Text className="text-center text-gray-600 mt-2">
          Enter your phone number or email to receive a secure login code
        </Text>

        <AuthCard>
          <TextInput
            placeholder="Email or Phone Number"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            className="border border-rose-200 rounded-xl px-5 py-4 text-base"
          />

          <TouchableOpacity
            activeOpacity={0.9}
            className="mt-6 bg-[#F15623] h-14 rounded-full items-center justify-center"
            onPress={() =>
              router.push(
                `/verify?contact=${encodeURIComponent(identifier || "")}`,
              )
            }
          >
            <Text className="text-white text-lg font-semibold">Get OTP</Text>
          </TouchableOpacity>

          <View className="mt-6 items-center">
            <Text className="text-gray-400">OR CONTINUE WITH</Text>
          </View>

          <View className="flex-row justify-center mt-4">
            <TouchableOpacity className="h-12 rounded-full border items-center justify-center bg-white px-6 flex-row">
              <Text className="text-2xl font-bold mr-2 text-[#4285F4]">G</Text>
              <Text className="text-base">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4 items-center">
            <Text className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Text className="text-[#F15623] font-semibold">
                <Link href="/signup">Sign Up</Link>
              </Text>
            </Text>
          </View>
        </AuthCard>

        <View className="items-center mt-6">
          <Text className="text-gray-500">By continuing, you agree to our</Text>
          <Text className="text-[#F15623]">
            Terms & Conditions and Privacy Policy.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
