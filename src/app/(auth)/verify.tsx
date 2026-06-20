import { useSignIn, useSignUp } from "@clerk/expo/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import OTPInput from "../../components/OTPInput";
import {
  AuthMethod,
  AuthMode,
  dedupeSupplementalFields,
  formatFieldLabel,
  getIdentifierKeyboardType,
  getIdentifierPlaceholder,
  getIdentifierStateField,
  getIdentifierUnverifiedKey,
  getIdentifierValue,
  getSupplementalSignUpFields,
  getUnverifiedIdentifierMethod,
  matchesVerifiedIdentifierField,
  normalizeSupplementalField,
  normalizeUnsupportedFields,
  normalizeContact,
  getVerifiedIdentifierField,
  SupplementalSignUpField,
  validateContact,
} from "../../lib/auth/otp";

type CompletionValues = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  emailAddress: string;
  phoneNumber: string;
  legalAccepted: boolean;
};

type VerificationTarget = {
  contact: string;
  field: "primary" | "emailAddress" | "phoneNumber";
  method: AuthMethod;
};

function getDefaultCompletionValues(): CompletionValues {
  return {
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    emailAddress: "",
    phoneNumber: "",
    legalAccepted: false,
  };
}

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    contact?: string;
    mode?: AuthMode;
    method?: AuthMethod;
  }>();
  const contact = params.contact || "your contact";
  const mode: AuthMode = params.mode === "signup" ? "signup" : "signin";
  const method: AuthMethod = params.method === "phone" ? "phone" : "email";

  const {
    isLoaded: isSignInLoaded,
    signIn,
    setActive: setActiveSignIn,
  } = useSignIn();
  const {
    isLoaded: isSignUpLoaded,
    signUp,
    setActive: setActiveSignUp,
  } = useSignUp();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCompletingSignUp, setIsCompletingSignUp] = useState(false);
  const [isPrimaryVerificationComplete, setIsPrimaryVerificationComplete] =
    useState(false);
  const [otpInputKey, setOtpInputKey] = useState(0);
  const [requiredFields, setRequiredFields] = useState<SupplementalSignUpField[]>(
    [],
  );
  const [unsupportedFields, setUnsupportedFields] = useState<string[]>([]);
  const [completionValues, setCompletionValues] = useState<CompletionValues>(
    getDefaultCompletionValues(),
  );
  const [verificationTarget, setVerificationTarget] = useState<VerificationTarget>(
    {
      contact,
      field: "primary",
      method,
    },
  );

  const needsAdditionalSignUpFields = requiredFields.length > 0;
  const verifiedIdentifierField = useMemo(
    () => getVerifiedIdentifierField(method),
    [method],
  );

  const activeContact = verificationTarget.contact;
  const activeMethod = verificationTarget.method;

  const startFollowUpVerification = async (
    targetField: "emailAddress" | "phoneNumber",
    targetContact: string,
  ) => {
    if (!signUp) {
      throw new Error("Sign-up verification is not ready yet.");
    }

    if (targetField === "emailAddress") {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } else {
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
    }

    setVerificationTarget({
      contact: targetContact,
      field: targetField,
      method: targetField === "emailAddress" ? "email" : "phone",
    });
    setIsPrimaryVerificationComplete(false);
    setOtpInputKey((current) => current + 1);
  };

  const completeSession = async (createdSessionId: string | null) => {
    if (!createdSessionId) {
      throw new Error("Clerk did not return a session after verification.");
    }

    if (mode === "signin") {
      if (!setActiveSignIn) {
        throw new Error("Sign-in session activation is not ready yet.");
      }

      await setActiveSignIn({ session: createdSessionId });
    } else {
      if (!setActiveSignUp) {
        throw new Error("Sign-up session activation is not ready yet.");
      }

      await setActiveSignUp({ session: createdSessionId });
    }

    router.replace("/");
  };

  const updateCompletionValue = (
    field: keyof CompletionValues,
    value: string | boolean,
  ) => {
    setCompletionValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSignUpContinuation = (
    missingFields: string[],
    fallbackMessage: string,
    unverifiedFields: string[] = [],
  ) => {
    const supplementalFields = dedupeSupplementalFields(
      getSupplementalSignUpFields(missingFields, method),
    );
    const remainingUnsupportedFields = normalizeUnsupportedFields([
      ...missingFields,
      ...unverifiedFields,
    ]).filter(
      (field, index, allFields) =>
        allFields.indexOf(field) === index &&
        !matchesVerifiedIdentifierField(field, verifiedIdentifierField) &&
        !supplementalFields.includes(field as SupplementalSignUpField),
    );

    setRequiredFields(supplementalFields);
    setUnsupportedFields(remainingUnsupportedFields);
    setIsPrimaryVerificationComplete(true);

    if (supplementalFields.length === 0 && remainingUnsupportedFields.length === 0) {
      Alert.alert("Sign-up incomplete", fallbackMessage);
    }
  };

  const handleVerify = async (code: string) => {
    if (
      isVerifying ||
      (mode === "signup" &&
        isPrimaryVerificationComplete &&
        verificationTarget.field === "primary")
    ) {
      return;
    }

    setIsVerifying(true);

    try {
      if (mode === "signin") {
        if (!isSignInLoaded || !signIn) {
          throw new Error("Sign-in verification is not ready yet.");
        }

        const result = await signIn.attemptFirstFactor({
          strategy: method === "email" ? "email_code" : "phone_code",
          code,
        });

        if (result.status === "complete") {
          await completeSession(result.createdSessionId);
          return;
        }

        throw new Error("Verification is not complete yet. Please try again.");
      }

      if (!isSignUpLoaded || !signUp) {
        throw new Error("Sign-up verification is not ready yet.");
      }

      const result =
        activeMethod === "email"
          ? await signUp.attemptEmailAddressVerification({ code })
          : await signUp.attemptPhoneNumberVerification({ code });

      if (result.status === "complete") {
        await completeSession(result.createdSessionId);
        return;
      }

      handleSignUpContinuation(
        result.missingFields,
        "More account details are required before we can finish your sign-up.",
        result.unverifiedFields,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed. Please try again.";
      console.error("Verification error", err);
      Alert.alert("Unable to verify OTP", message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (
      isResending ||
      (mode === "signup" &&
        isPrimaryVerificationComplete &&
        verificationTarget.field === "primary")
    ) {
      return;
    }

    setIsResending(true);

    try {
      if (mode === "signin") {
        if (!isSignInLoaded || !signIn) {
          throw new Error("Sign-in verification is not ready yet.");
        }

        const supportedFactors = signIn.supportedFirstFactors ?? [];

        if (method === "email") {
          const factor = supportedFactors.find(
            (item) => item.strategy === "email_code",
          );

          if (!factor || !("emailAddressId" in factor)) {
            throw new Error("Email OTP sign-in is not enabled in Clerk.");
          }

          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: factor.emailAddressId,
          });
        } else {
          const factor = supportedFactors.find(
            (item) => item.strategy === "phone_code",
          );

          if (!factor || !("phoneNumberId" in factor)) {
            throw new Error("Phone OTP sign-in is not enabled in Clerk.");
          }

          await signIn.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: factor.phoneNumberId,
          });
        }
      } else {
        if (!isSignUpLoaded || !signUp) {
          throw new Error("Sign-up verification is not ready yet.");
        }

        if (activeMethod === "email") {
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        } else {
          await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
        }
      }

      Alert.alert("OTP sent", `A new code was sent to ${activeContact}.`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We could not resend the OTP right now.";
      console.error("Resend OTP error", err);
      Alert.alert("Unable to resend OTP", message);
    } finally {
      setIsResending(false);
    }
  };

  const handleCompleteSignUp = async () => {
    if (!isSignUpLoaded || !signUp) {
      Alert.alert(
        "Auth not ready",
        "Sign-up completion is still initializing. Please try again.",
      );
      return;
    }

    const payload: {
      firstName?: string;
      lastName?: string;
      username?: string;
      password?: string;
      emailAddress?: string;
      phoneNumber?: string;
      legalAccepted?: boolean;
    } = {};

    for (const field of requiredFields) {
      if (field === "legalAccepted") {
        if (!completionValues.legalAccepted) {
          Alert.alert(
            "More details required",
            "Please accept the terms to finish creating your account.",
          );
          return;
        }

        payload.legalAccepted = true;
        continue;
      }

      if (field === "emailAddress" || field === "phoneNumber") {
        const validation = validateContact(
          field === "emailAddress" ? "email" : "phone",
          completionValues[field],
        );

        if (validation.error) {
          Alert.alert("More details required", validation.error);
          return;
        }

        payload[field] = validation.normalized;
        continue;
      }

      const value = completionValues[field].trim();

      if (!value) {
        Alert.alert(
          "More details required",
          `Please enter ${formatFieldLabel(field).toLowerCase()}.`,
        );
        return;
      }

      payload[field] = value;
    }

    setIsCompletingSignUp(true);

    try {
      const updatedSignUp = await signUp.update(payload);

      if (updatedSignUp.status === "complete") {
        await completeSession(updatedSignUp.createdSessionId);
        return;
      }

      for (const unverifiedField of updatedSignUp.unverifiedFields) {
        const followUpMethod = getUnverifiedIdentifierMethod(unverifiedField);

        if (!followUpMethod) {
          continue;
        }

        const targetField = getIdentifierStateField(followUpMethod);
        const targetContact =
          followUpMethod === "email"
            ? normalizeContact("email", updatedSignUp.emailAddress ?? "")
            : normalizeContact("phone", updatedSignUp.phoneNumber ?? "");

        if (
          targetContact &&
          verificationTarget.field !== targetField
        ) {
          await startFollowUpVerification(targetField, targetContact);
          return;
        }
      }

      handleSignUpContinuation(
        updatedSignUp.missingFields,
        "Your account still needs more required details before sign-up can finish.",
        updatedSignUp.unverifiedFields,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We could not finish your sign-up right now.";
      console.error("Sign-up completion error", err);
      Alert.alert("Unable to complete sign-up", message);
    } finally {
      setIsCompletingSignUp(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fff6f4]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-6 pb-10 pt-12">
          <Text className="text-center text-3xl font-extrabold">
            Verify Details
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-600">
            {isPrimaryVerificationComplete && mode === "signup"
              ? `OTP verified for ${activeContact}`
              : `Enter the OTP sent to ${activeContact}`}
          </Text>

          {!isPrimaryVerificationComplete ? (
            <>
              <View className="mt-8">
                <OTPInput
                  key={otpInputKey}
                  length={6}
                  onComplete={async (code: string) => {
                    await handleVerify(code);
                  }}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isResending}
                className="mt-6 h-12 items-center justify-center rounded-full border border-[#F15623]"
                onPress={handleResend}
              >
                <Text className="font-semibold text-[#F15623]">
                  {isResending ? "Resending..." : "Resend OTP"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="mt-6 rounded-2xl bg-white p-4 shadow-md">
              <Text className="text-center text-sm font-medium text-[#1f6f43]">
                Primary verification is complete. Finish the remaining account
                details below.
              </Text>
            </View>
          )}

          {needsAdditionalSignUpFields ? (
            <View className="mt-8 rounded-3xl bg-white p-6 shadow-md">
              <Text className="text-xl font-bold text-black">
                Complete Your Sign-Up
              </Text>
              <Text className="mt-2 text-sm text-gray-600">
                Your OTP is verified. Clerk still needs the following fields to
                create your account.
              </Text>

              <View className="mt-5 gap-3">
                {requiredFields.includes("firstName") ? (
                  <TextInput
                    placeholder="First Name"
                    value={completionValues.firstName}
                    onChangeText={(value) =>
                      updateCompletionValue("firstName", value)
                    }
                    className="rounded-xl border border-rose-200 px-5 py-4 text-base"
                  />
                ) : null}

                {requiredFields.includes("lastName") ? (
                  <TextInput
                    placeholder="Last Name"
                    value={completionValues.lastName}
                    onChangeText={(value) =>
                      updateCompletionValue("lastName", value)
                    }
                    className="rounded-xl border border-rose-200 px-5 py-4 text-base"
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
                    className="rounded-xl border border-rose-200 px-5 py-4 text-base"
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
                    className="rounded-xl border border-rose-200 px-5 py-4 text-base"
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
                    className="rounded-xl border border-rose-200 px-5 py-4 text-base"
                  />
                ) : null}

                {requiredFields.includes("phoneNumber") ? (
                  <TextInput
                    placeholder={getIdentifierPlaceholder("phone")}
                    value={completionValues.phoneNumber}
                    keyboardType={getIdentifierKeyboardType("phone")}
                    onChangeText={(value) =>
                      updateCompletionValue("phoneNumber", value)
                    }
                    className="rounded-xl border border-rose-200 px-5 py-4 text-base"
                  />
                ) : null}

                {requiredFields.includes("phoneNumber") ? (
                  <Text className="text-xs text-gray-500">
                    Enter `9876543210` or `+919876543210`. We will normalize it
                    automatically.
                  </Text>
                ) : null}

                {requiredFields.includes("legalAccepted") ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    className="flex-row items-center rounded-xl border border-rose-200 px-4 py-4"
                    onPress={() =>
                      updateCompletionValue(
                        "legalAccepted",
                        !completionValues.legalAccepted,
                      )
                    }
                  >
                    <View
                      className={`mr-3 h-5 w-5 rounded border ${
                        completionValues.legalAccepted
                          ? "border-[#F15623] bg-[#F15623]"
                          : "border-gray-300 bg-white"
                      }`}
                    />
                    <Text className="flex-1 text-sm text-gray-700">
                      I agree to the Terms & Conditions and Privacy Policy.
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isCompletingSignUp}
                className="mt-6 h-12 items-center justify-center rounded-full bg-[#F15623]"
                onPress={handleCompleteSignUp}
              >
                <Text className="font-semibold text-white">
                  {isCompletingSignUp
                    ? "Finishing sign-up..."
                    : "Complete Sign-Up"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {unsupportedFields.length > 0 ? (
            <View className="mt-6 rounded-2xl bg-white p-5 shadow-md">
              <Text className="text-base font-semibold text-black">
                More configuration is required
              </Text>
              <Text className="mt-2 text-sm leading-5 text-gray-600">
                Clerk is still asking for:{" "}
                {unsupportedFields.map(formatFieldLabel).join(", ")}. This means
                your Clerk sign-up instance requires additional fields that are not
                yet handled in this screen.
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.9}
            className="mt-8 h-12 items-center justify-center rounded-full bg-gray-200"
            onPress={() => router.back()}
          >
            <Text className="text-lg font-semibold text-gray-700">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
