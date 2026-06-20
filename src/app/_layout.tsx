import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import "../../global.css";
import { loadFonts } from "@/theme/fonts";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — add it to your .env file. Auth will not work without it.",
  );
}

function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const onOnboarding = segments[0] === "onboarding";
    const onSsoCallback = segments[0] === "sso-callback";

    if (!isSignedIn && !inAuthGroup && !onOnboarding && !onSsoCallback) {
      router.replace("/onboarding");
    }

    if (isSignedIn && (inAuthGroup || onOnboarding)) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await loadFonts();
      setReady(true);
      await SplashScreen.hideAsync();
    })();
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey || ""} tokenCache={tokenCache}>
      <AuthGate />
    </ClerkProvider>
  );
}
