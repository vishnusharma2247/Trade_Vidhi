import { useSignUp } from "@clerk/expo/legacy";
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
import AuthMethodToggle from "../../components/AuthMethodToggle";
import ClerkCaptchaContainer from "../../components/ClerkCaptchaContainer";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import {
  AuthMethod,
  getContactKeyboardType,
  getContactPlaceholder,
  validateContact,
} from "../../lib/auth/otp";

export default function SignUp() {
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>("email");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const { isLoaded, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  const requestOtp = async () => {
    const { normalized, error } = validateContact(method, contact);

    if (error) {
      Alert.alert("Invalid details", error);
      return;
    }

    if (!isLoaded || !signUp) {
      Alert.alert(
        "Auth not ready",
        "Authentication is still initializing. Please try again in a moment.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const createdSignUp =
        method === "email"
          ? await signUp.create({ emailAddress: normalized })
          : await signUp.create({ phoneNumber: normalized });

      if (method === "email") {
        await createdSignUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      } else {
        await createdSignUp.preparePhoneNumberVerification({
          strategy: "phone_code",
        });
      }

      router.push(
        `/verify?contact=${encodeURIComponent(normalized)}&mode=signup&method=${method}`,
      );
    } catch (err) {
      const rawMessage =
        err instanceof Error
          ? err.message
          : "We could not send an OTP right now. Please try again.";
      const message = rawMessage.toLowerCase().includes("captcha")
        ? "Clerk bot protection could not load in this browser. On web, try disabling ad blockers or privacy extensions, then refresh and try again."
        : rawMessage;
      console.error("Sign-up OTP request error", err);
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
        "Google sign-up could not be completed. Please try again.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Google sign-up is unavailable right now.";
      console.error("Google sign-up error", err);
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
          Create Account
        </Text>
        <Text className="mt-2 text-center text-gray-600">
          Start with an email or phone OTP. We will only ask for extra details if
          your account setup requires them.
        </Text>

        <AuthCard>
          <AuthMethodToggle value={method} onChange={setMethod} />

          <TextInput
            placeholder={getContactPlaceholder(method)}
            value={contact}
            onChangeText={setContact}
            keyboardType={getContactKeyboardType(method)}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting && !isGoogleSubmitting}
            className="rounded-xl border border-rose-200 px-5 py-4 text-base"
          />

          {method === "phone" ? (
            <Text className="mt-3 text-xs text-gray-500">
              Enter `9876543210` or `+919876543210`. We will normalize it
              automatically.
            </Text>
          ) : null}

          <ClerkCaptchaContainer />

          {Platform.OS === "web" ? (
            <Text className="mt-3 text-xs text-gray-500">
              If sign-up is blocked, disable ad blockers or privacy extensions and
              refresh the page so Clerk CAPTCHA can load.
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={isSubmitting || isGoogleSubmitting}
            className="mt-6 h-14 items-center justify-center rounded-full bg-[#F15623]"
            onPress={requestOtp}
          >
            <Text className="text-lg font-semibold text-white">
              {isSubmitting ? "Sending OTP..." : "Create Account"}
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
              Already have an account?{" "}
              <Text className="font-semibold text-[#F15623]">
                <Link href="/signin">Sign In</Link>
              </Text>
            </Text>
          </View>
        </AuthCard>
      </View>
    </KeyboardAvoidingView>
  );
}
