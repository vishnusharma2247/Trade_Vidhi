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

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fff6f4]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-12">
        <Text className="text-4xl font-extrabold text-center">
          Create Account
        </Text>
        <Text className="text-center text-gray-600 mt-2">
          Sign up to continue and get personalized recommendations
        </Text>

        <AuthCard>
          <TextInput
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            className="border border-rose-200 rounded-xl px-5 py-4 text-base mb-3"
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            className="border border-rose-200 rounded-xl px-5 py-4 text-base mb-3"
          />

          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="border border-rose-200 rounded-xl px-5 py-4 text-base mb-3"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="border border-rose-200 rounded-xl px-5 py-4 text-base"
          />

          <TouchableOpacity
            activeOpacity={0.9}
            className="mt-6 bg-[#F15623] h-14 rounded-full items-center justify-center"
            onPress={() =>
              router.push(
                `/verify?contact=${encodeURIComponent(email || phone || "")}`,
              )
            }
          >
            <Text className="text-white text-lg font-semibold">
              Create Account
            </Text>
          </TouchableOpacity>

          <View className="mt-4 items-center">
            <Text className="text-sm text-gray-600">
              Already have an account?{" "}
              <Text className="text-[#F15623] font-semibold">
                <Link href="/signin">Sign In</Link>
              </Text>
            </Text>
          </View>
        </AuthCard>
      </View>
    </KeyboardAvoidingView>
  );
}
