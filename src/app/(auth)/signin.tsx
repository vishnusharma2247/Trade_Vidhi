import { useSignIn } from "@clerk/expo/legacy";
import { useSSO } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AuthCard from "../../components/AuthCard";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import {
  getContactKeyboardType,
  getContactPlaceholder,
  validateContact,
} from "../../lib/auth/otp";

export default function SignIn() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const { isLoaded, signIn } = useSignIn();
  const { startSSOFlow } = useSSO();

  const requestOtp = async () => {
    const { normalized, error } = validateContact("email", contact);

    if (error) {
      Alert.alert("Invalid details", error);
      return;
    }

    if (!isLoaded || !signIn) {
      Alert.alert(
        "Auth not ready",
        "Authentication is still initializing. Please try again in a moment.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const createdSignIn = await signIn.create({ identifier: normalized });
      const supportedFactors = createdSignIn.supportedFirstFactors ?? [];

      const factor = supportedFactors.find(
        (item) => item.strategy === "email_code",
      );

      if (!factor || !("emailAddressId" in factor)) {
        throw new Error(
          "Email OTP sign-in is not enabled in your Clerk configuration.",
        );
      }

      await createdSignIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: factor.emailAddressId,
      });

      router.push(
        `/verify?contact=${encodeURIComponent(normalized)}&mode=signin&method=email`,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We could not send an OTP right now. Please try again.";
      console.error("Sign-in OTP request error", err);
      Alert.alert("Unable to send OTP", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueWithGoogle = async () => {
    setIsGoogleSubmitting(true);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
        return;
      }

      throw new Error(
        "Google sign-in could not be completed. Please try again.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Google sign-in is unavailable right now.";
      console.error("Google sign-in error", err);
      Alert.alert("Unable to continue with Google", message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fff6f4]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-12">
        <Text className="text-center text-4xl font-extrabold">
          Welcome to TradeVidhi
        </Text>
        <Text className="mt-2 text-center text-gray-600">
          Sign in with a one-time password sent to your email.
        </Text>

        <AuthCard>
          <TextInput
            placeholder={getContactPlaceholder("email")}
            value={contact}
            onChangeText={setContact}
            keyboardType={getContactKeyboardType("email")}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting && !isGoogleSubmitting}
            className="rounded-xl border border-rose-200 px-5 py-4 text-base"
          />

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={isSubmitting || isGoogleSubmitting}
            className="mt-6 h-14 items-center justify-center rounded-full bg-[#F15623]"
            onPress={requestOtp}
          >
            <Text className="text-lg font-semibold text-white">
              {isSubmitting ? "Sending OTP..." : "Get OTP"}
            </Text>
          </TouchableOpacity>

          <View className="mt-6 items-center">
            <Text className="text-xs tracking-[2px] text-gray-400">
              OR CONTINUE WITH
            </Text>
          </View>

          <GoogleAuthButton
            disabled={isSubmitting || isGoogleSubmitting}
            label={
              isGoogleSubmitting
                ? "Connecting to Google..."
                : "Continue with Google"
            }
            onPress={continueWithGoogle}
          />

          <View className="mt-4 items-center">
            <Text className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Text className="font-semibold text-[#F15623]">
                <Link href="/signup">Sign Up</Link>
              </Text>
            </Text>
          </View>
        </AuthCard>

        <View className="mt-6 items-center">
          <Text className="text-gray-500">By continuing, you agree to our</Text>
          <Text className="text-[#F15623]">
            Terms & Conditions and Privacy Policy.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
