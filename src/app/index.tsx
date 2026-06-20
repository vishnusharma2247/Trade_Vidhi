import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const { isLoaded, isSignedIn, signOut } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // navigate after render to avoid triggering updates during render
      router.replace("/onboarding");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return null;

  if (!isSignedIn) return null;

  return (
    <View style={styles.container}>
      <Text className="justify-center font-bold text-4xl text-black display-lg-bold">
        TradeVidhi Finance
      </Text>

      <TouchableOpacity
        style={styles.openButton}
        onPress={() => router.push("/onboarding")}
      >
        <Text style={styles.openButtonText}>Open Onboarding</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await signOut();
          router.replace("/onboarding");
        }}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  openButton: {
    marginTop: 24,
    backgroundColor: "#F15623",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  openButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 14,
    backgroundColor: "#1f2937",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
