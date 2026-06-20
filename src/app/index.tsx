import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@clerk/expo";

export default function Index() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <Text className="text-[32px] font-bold tracking-tight text-foreground">
        TradeVidhi
      </Text>
      <Text className="mt-1 text-[15px] text-foreground-muted">
        Your portfolio awaits
      </Text>

      <TouchableOpacity
        className="mt-8 h-[48px] w-full items-center justify-center rounded-full bg-primary"
        activeOpacity={0.85}
        onPress={() => router.push("/onboarding")}
      >
        <Text className="text-[15px] font-semibold text-white">
          Open Onboarding
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-3 h-[48px] w-full items-center justify-center rounded-full bg-surface-muted"
        activeOpacity={0.7}
        onPress={async () => {
          await signOut();
        }}
      >
        <Text className="text-[15px] font-medium text-foreground-muted">
          Sign out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
