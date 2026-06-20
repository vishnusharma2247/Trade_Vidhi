import { useSignUp } from "@clerk/expo/legacy";
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
import AuthCard from "@/components/AuthCard";
import ClerkCaptchaContainer from "@/components/ClerkCaptchaContainer";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { useGoogleSSO } from "@/hooks/useGoogleSSO";
import { validateContact } from "@/lib/auth/otp";

export default function SignUp() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, signUp } = useSignUp();
  const { continueWithGoogle, isGoogleSubmitting } = useGoogleSSO();

  const requestOtp = async () => {
    setError(null);
    const { normalized, error: validationError } = validateContact(
      "email",
      contact,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!isLoaded || !signUp) {
      setError("Authentication is still initializing. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdSignUp = await signUp.create({ emailAddress: normalized });
      await createdSignUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      router.push(
        `/verify?contact=${encodeURIComponent(normalized)}&mode=signup&method=email`,
      );
    } catch (err) {
      const rawMessage =
        err instanceof Error
          ? err.message
          : "We could not send an OTP right now. Please try again.";
      const message = rawMessage.toLowerCase().includes("captcha")
        ? "Bot protection could not load. Try disabling ad blockers or privacy extensions, then refresh."
        : rawMessage;
      console.error("Sign-up OTP request error", err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || isGoogleSubmitting;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-5 pt-16">
        <Text className="text-[28px] font-bold tracking-tight text-foreground">
          Create account
        </Text>
        <Text className="mt-2 text-[15px] leading-[22px] text-foreground-muted">
          We'll send a verification code to your email to get started.
        </Text>

        <AuthCard>
          <TextInput
            placeholder="Email address"
            value={contact}
            onChangeText={(text) => {
              setContact(text);
              if (error) setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isDisabled}
            placeholderTextColor="#9b9b9b"
            className={`h-[52px] rounded-xl px-4 text-[15px] text-foreground ${
              error
                ? "border-[1.5px] border-error bg-surface-elevated"
                : "border-[1.5px] border-transparent bg-surface-muted"
            }`}
          />

          {error ? (
            <Text className="mt-2 text-xs font-medium text-error">
              {error}
            </Text>
          ) : null}

          <ClerkCaptchaContainer />

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isDisabled}
            className={`mt-5 h-[52px] items-center justify-center rounded-full bg-primary ${isDisabled ? "opacity-50" : ""}`}
            onPress={requestOtp}
          >
            <Text className="text-[15px] font-semibold text-white">
              {isSubmitting ? "Sending code..." : "Continue"}
            </Text>
          </TouchableOpacity>

          <View className="my-6 flex-row items-center">
            <View className="flex-1 border-b border-outline-subtle" />
            <Text className="px-3 text-[11px] font-medium uppercase tracking-widest text-foreground-subtle">
              or
            </Text>
            <View className="flex-1 border-b border-outline-subtle" />
          </View>

          <GoogleAuthButton
            disabled={isDisabled}
            label={
              isGoogleSubmitting
                ? "Connecting to Google..."
                : "Continue with Google"
            }
            onPress={continueWithGoogle}
          />

          <View className="mt-6 items-center">
            <Text className="text-[13px] text-foreground-muted">
              Already have an account?{" "}
              <Link href="/signin">
                <Text className="font-semibold text-primary">Sign in</Text>
              </Link>
            </Text>
          </View>
        </AuthCard>

        <Text className="mt-8 text-center text-[12px] leading-[18px] text-foreground-subtle">
          By continuing, you agree to our{" "}
          <Text className="text-foreground-muted">Terms & Conditions</Text> and{" "}
          <Text className="text-foreground-muted">Privacy Policy</Text>.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
