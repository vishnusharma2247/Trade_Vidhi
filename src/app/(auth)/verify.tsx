import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import OTPInput from "@/components/OTPInput";
import { useVerification } from "@/hooks/useVerification";
import {
  formatFieldLabel,
  getIdentifierKeyboardType,
  getIdentifierPlaceholder,
} from "@/lib/auth/otp";

const RESEND_COOLDOWN = 60;

export default function VerifyScreen() {
  const router = useRouter();
  const {
    mode,
    activeContact,
    isPrimaryVerificationComplete,
    isVerifying,
    isResending,
    isCompletingSignUp,
    otpInputKey,
    requiredFields,
    unsupportedFields,
    completionValues,
    needsAdditionalSignUpFields,
    handleVerify,
    handleResend,
    handleCompleteSignUp,
    updateCompletionValue,
  } = useVerification();

  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [otpError, setOtpError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [otpInputKey]);

  const onResend = useCallback(async () => {
    await handleResend();
    setCountdown(RESEND_COOLDOWN);
    setOtpError(null);
  }, [handleResend]);

  const onVerify = useCallback(
    async (code: string) => {
      setOtpError(null);
      try {
        await handleVerify(code);
      } catch {
        setOtpError("Incorrect code. Please try again.");
      }
    },
    [handleVerify],
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-5 pb-10 pt-16">
          {/* Back button */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
            onPress={() => router.back()}
          >
            <Text className="text-lg text-foreground">←</Text>
          </TouchableOpacity>

          <Text className="text-[28px] font-bold tracking-tight text-foreground">
            {isPrimaryVerificationComplete && mode === "signup"
              ? "Almost there"
              : "Enter code"}
          </Text>
          <Text className="mt-2 text-[15px] leading-[22px] text-foreground-muted">
            {isPrimaryVerificationComplete && mode === "signup"
              ? `Code verified for ${activeContact}`
              : `We sent a 6-digit code to `}
            {!isPrimaryVerificationComplete && (
              <Text className="font-medium text-foreground">
                {activeContact}
              </Text>
            )}
          </Text>

          {!isPrimaryVerificationComplete ? (
            <View className="mt-10">
              <OTPInput
                key={otpInputKey}
                length={6}
                onComplete={onVerify}
                hasError={!!otpError}
              />

              {otpError ? (
                <View className="mt-4 rounded-lg bg-error/5 px-4 py-3">
                  <Text className="text-center text-[13px] font-medium text-error">
                    {otpError}
                  </Text>
                </View>
              ) : null}

              {isVerifying ? (
                <Text className="mt-4 text-center text-[13px] text-foreground-subtle">
                  Verifying...
                </Text>
              ) : null}

              {/* Resend */}
              <View className="mt-6 items-center">
                {countdown > 0 ? (
                  <Text className="text-[13px] text-foreground-subtle">
                    Resend code in{" "}
                    <Text className="font-semibold text-foreground-muted">
                      {formatTime(countdown)}
                    </Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={isResending}
                    onPress={onResend}
                  >
                    <Text className="text-[14px] font-semibold text-primary">
                      {isResending ? "Sending..." : "Resend code"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View className="mt-6 rounded-xl bg-success/10 px-4 py-3">
              <Text className="text-center text-[13px] font-medium text-success">
                Email verified successfully. Complete your account below.
              </Text>
            </View>
          )}

          {/* Additional sign-up fields */}
          {needsAdditionalSignUpFields ? (
            <View className="mt-8 rounded-2xl bg-surface-elevated p-6 shadow-md">
              <Text className="text-[18px] font-semibold text-foreground">
                Complete your profile
              </Text>
              <Text className="mt-1 text-[13px] text-foreground-muted">
                A few more details to set up your account.
              </Text>

              <View className="mt-5 gap-3">
                {requiredFields.includes("firstName") ? (
                  <TextInput
                    placeholder="First name"
                    value={completionValues.firstName}
                    onChangeText={(value) =>
                      updateCompletionValue("firstName", value)
                    }
                    placeholderTextColor="#9b9b9b"
                    className="h-[52px] rounded-xl border-[1.5px] border-transparent bg-surface-muted px-4 text-[15px] text-foreground"
                  />
                ) : null}

                {requiredFields.includes("lastName") ? (
                  <TextInput
                    placeholder="Last name"
                    value={completionValues.lastName}
                    onChangeText={(value) =>
                      updateCompletionValue("lastName", value)
                    }
                    placeholderTextColor="#9b9b9b"
                    className="h-[52px] rounded-xl border-[1.5px] border-transparent bg-surface-muted px-4 text-[15px] text-foreground"
                  />
                ) : null}

                {requiredFields.includes("username") ? (
                  <TextInput
                    placeholder="Username"
                    value={completionValues.username}
                    autoCapitalize="none"
                    onChangeText={(value) =>
                      updateCompletionValue("username", value)
                    }
                    placeholderTextColor="#9b9b9b"
                    className="h-[52px] rounded-xl border-[1.5px] border-transparent bg-surface-muted px-4 text-[15px] text-foreground"
                  />
                ) : null}

                {requiredFields.includes("password") ? (
                  <TextInput
                    placeholder="Password"
                    value={completionValues.password}
                    secureTextEntry
                    onChangeText={(value) =>
                      updateCompletionValue("password", value)
                    }
                    placeholderTextColor="#9b9b9b"
                    className="h-[52px] rounded-xl border-[1.5px] border-transparent bg-surface-muted px-4 text-[15px] text-foreground"
                  />
                ) : null}

                {requiredFields.includes("emailAddress") ? (
                  <TextInput
                    placeholder={getIdentifierPlaceholder("email")}
                    value={completionValues.emailAddress}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType={getIdentifierKeyboardType("email")}
                    onChangeText={(value) =>
                      updateCompletionValue("emailAddress", value)
                    }
                    placeholderTextColor="#9b9b9b"
                    className="h-[52px] rounded-xl border-[1.5px] border-transparent bg-surface-muted px-4 text-[15px] text-foreground"
                  />
                ) : null}

                {requiredFields.includes("legalAccepted") ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row items-center rounded-xl bg-surface-muted px-4 py-4"
                    onPress={() =>
                      updateCompletionValue(
                        "legalAccepted",
                        !completionValues.legalAccepted,
                      )
                    }
                  >
                    <View
                      className={`mr-3 h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
                        completionValues.legalAccepted
                          ? "border-primary bg-primary"
                          : "border-outline bg-surface-elevated"
                      }`}
                    >
                      {completionValues.legalAccepted ? (
                        <Text className="text-[10px] text-white">✓</Text>
                      ) : null}
                    </View>
                    <Text className="flex-1 text-[13px] text-foreground-muted">
                      I agree to the Terms & Conditions and Privacy Policy.
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isCompletingSignUp}
                className={`mt-6 h-[52px] items-center justify-center rounded-full bg-primary ${isCompletingSignUp ? "opacity-50" : ""}`}
                onPress={handleCompleteSignUp}
              >
                <Text className="text-[15px] font-semibold text-white">
                  {isCompletingSignUp ? "Creating account..." : "Complete setup"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {unsupportedFields.length > 0 ? (
            <View className="mt-6 rounded-xl bg-warning/10 px-4 py-3">
              <Text className="text-[13px] font-medium text-warning">
                Additional configuration needed:{" "}
                {unsupportedFields.map(formatFieldLabel).join(", ")}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
