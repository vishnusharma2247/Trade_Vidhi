import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

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
    backgroundColor: "#d3410b",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  openButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
