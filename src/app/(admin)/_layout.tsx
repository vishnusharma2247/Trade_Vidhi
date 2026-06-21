import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/expo";
import { ShieldAlert } from "lucide-react-native";

export default function AdminLayout() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) return null;

  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-error/10">
          <ShieldAlert size={28} strokeWidth={1.5} color="#dc2626" />
        </View>
        <Text className="mt-5 text-[20px] font-semibold text-foreground">
          Access Denied
        </Text>
        <Text className="mt-2 text-center text-[14px] leading-[20px] text-foreground-muted">
          You don't have admin permissions to access this section.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          className="mt-8 h-[48px] w-full items-center justify-center rounded-full bg-primary"
          onPress={() => router.back()}
        >
          <Text className="text-[15px] font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
