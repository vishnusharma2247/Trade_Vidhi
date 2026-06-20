import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Bell, User } from "lucide-react-native";
import { getUnreadNotifications } from "@/data/mock";

interface AppHeaderProps {
  showProfile?: boolean;
  showNotifications?: boolean;
}

export default function AppHeader({
  showProfile = true,
  showNotifications = true,
}: AppHeaderProps) {
  const router = useRouter();
  const unreadCount = getUnreadNotifications().length;

  return (
    <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
      {showProfile ? (
        <TouchableOpacity
          activeOpacity={0.7}
          className="h-9 w-9 items-center justify-center rounded-full border border-outline bg-surface-elevated"
          accessibilityLabel="Profile"
          accessibilityRole="button"
        >
          <User size={16} strokeWidth={1.5} color="#6b6b6b" />
        </TouchableOpacity>
      ) : (
        <View className="w-9" />
      )}

      <Text className="text-[18px] font-bold tracking-tight text-foreground">
        TradeVidhi
      </Text>

      {showNotifications ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/notifications")}
          className="relative h-9 w-9 items-center justify-center rounded-full"
          accessibilityLabel={`Notifications, ${unreadCount} unread`}
          accessibilityRole="button"
        >
          <Bell size={20} strokeWidth={1.5} color="#1a1a1a" />
          {unreadCount > 0 && (
            <View className="absolute right-1 top-1 h-[7px] w-[7px] rounded-full bg-primary" />
          )}
        </TouchableOpacity>
      ) : (
        <View className="w-9" />
      )}
    </View>
  );
}
