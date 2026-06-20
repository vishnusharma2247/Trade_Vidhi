import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle2,
  TrendingDown,
  Bell,
  Megaphone,
  Info,
} from "lucide-react-native";
import { mockNotifications } from "@/data/mock";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data: { screen?: string; id?: string } | null;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "new_recommendation":
      return { Icon: TrendingUp, bg: "bg-primary-light", color: "#F15623" };
    case "target_hit":
      return { Icon: CheckCircle2, bg: "bg-success/10", color: "#16a34a" };
    case "sl_hit":
      return { Icon: TrendingDown, bg: "bg-error/10", color: "#dc2626" };
    case "portfolio_alert":
      return { Icon: TrendingDown, bg: "bg-error/10", color: "#dc2626" };
    case "recommendation_update":
      return { Icon: Megaphone, bg: "bg-warning/10", color: "#f59e0b" };
    case "system":
      return { Icon: Info, bg: "bg-surface-muted", color: "#6b6b6b" };
    default:
      return { Icon: Bell, bg: "bg-surface-muted", color: "#6b6b6b" };
  }
}

function formatTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getDayGroup(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  if (diffDays < 7) return "THIS WEEK";
  return "EARLIER";
}

function groupNotifications(notifications: NotificationItem[]) {
  const groups: Record<string, NotificationItem[]> = {};
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  for (const notif of sorted) {
    const key = getDayGroup(notif.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(notif);
  }

  const order = ["TODAY", "YESTERDAY", "THIS WEEK", "EARLIER"];
  return order
    .filter((key) => groups[key])
    .map((title) => ({ title, data: groups[title] }));
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(
    mockNotifications as NotificationItem[]
  );

  const sections = useMemo(() => groupNotifications(notifications), [notifications]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const handleBack = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, [router]);

  const handleMarkAllRead = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const handleNotificationPress = useCallback(
    (notif: NotificationItem) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      if (notif.data?.screen === "recommendation" && notif.data?.id) {
        router.push(`/recommendations/${notif.data.id}`);
      }
    },
    [router]
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          className="h-9 w-9 items-center justify-center rounded-full"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} strokeWidth={1.8} color="#1a1a1a" />
        </TouchableOpacity>

        <Text className="text-[20px] font-bold tracking-tight text-foreground">
          Notifications
        </Text>

        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
            accessibilityLabel="Mark all as read"
            accessibilityRole="button"
          >
            <Text className="text-[13px] font-semibold text-primary">
              Mark all as read
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-[90px]" />
        )}
      </View>

      {/* Notification List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View className="px-5 pb-2 pt-5">
            <Text className="text-[11px] font-semibold tracking-wider text-foreground-subtle">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const { Icon, bg, color } = getNotificationIcon(item.type);

          return (
            <View className="px-5 pb-[6px]">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(item)}
                className={`relative flex-row items-center rounded-2xl px-4 py-[14px] ${
                  item.isRead ? "bg-surface-elevated" : "bg-surface-elevated"
                }`}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                {/* Unread dot */}
                {!item.isRead && (
                  <View className="absolute left-2 top-3 h-[7px] w-[7px] rounded-full bg-primary" />
                )}

                {/* Icon */}
                <View
                  className={`h-[44px] w-[44px] items-center justify-center rounded-full ${bg}`}
                >
                  <Icon size={20} strokeWidth={1.8} color={color} />
                </View>

                {/* Content */}
                <View className="ml-3 flex-1">
                  <Text
                    className={`text-[14px] ${
                      item.isRead
                        ? "font-medium text-foreground"
                        : "font-bold text-foreground"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="mt-[2px] text-[12px] text-foreground-muted"
                    numberOfLines={1}
                  >
                    {item.body}
                  </Text>
                </View>

                {/* Time */}
                <Text className="ml-2 text-[11px] text-foreground-subtle">
                  {formatTime(item.createdAt)}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View className="items-center px-8 pt-24">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
              <Bell size={24} strokeWidth={1.5} color="#9b9b9b" />
            </View>
            <Text className="mt-4 text-center text-[16px] font-semibold text-foreground">
              No notifications
            </Text>
            <Text className="mt-1 text-center text-[14px] leading-5 text-foreground-muted">
              You're all caught up. We'll notify you when something important happens.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
