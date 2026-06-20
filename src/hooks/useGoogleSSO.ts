import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export function useGoogleSSO() {
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const continueWithGoogle = async () => {
    setIsSubmitting(true);

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
      console.error("Google SSO error", err);
      Alert.alert("Unable to continue with Google", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { continueWithGoogle, isGoogleSubmitting: isSubmitting };
}
