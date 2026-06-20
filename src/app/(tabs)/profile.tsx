import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";

export default function ProfileScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-[28px] font-bold tracking-tight text-foreground">
          Profile
        </Text>
        <Text className="mt-1 text-[14px] text-foreground-muted">
          Account & settings
        </Text>

        <TouchableOpacity
          className="mt-8 h-[48px] items-center justify-center rounded-xl bg-surface-muted"
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
    </SafeAreaView>
  );
}
