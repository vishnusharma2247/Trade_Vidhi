import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import {
  Bell,
  UserPen,
  ShieldCheck,
  Briefcase,
  Building2,
  Bookmark,
  BellRing,
  Mail,
  Lock,
  Smartphone,
  Headphones,
  FileText,
  ShieldAlert,
  Scale,
  LogOut,
  ChevronRight,
  BadgeCheck,
} from "lucide-react-native";
import { mockUser } from "@/data/mock";

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingsRow({ icon, label, trailing, onPress, destructive }: SettingsRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center px-4 py-[14px]"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View className="h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-surface-muted">
        {icon}
      </View>
      <Text
        className={`ml-3 flex-1 text-[14px] font-medium ${
          destructive ? "text-error" : "text-foreground"
        }`}
      >
        {label}
      </Text>
      {trailing ?? <ChevronRight size={16} strokeWidth={1.8} color="#9b9b9b" />}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="mb-1 mt-6 px-4 text-[11px] font-semibold tracking-wider text-foreground-subtle">
      {title}
    </Text>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const handleLogout = useCallback(async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          try {
            await signOut();
          } catch (err) {
            console.error("Sign out failed", err);
            Alert.alert("Unable to sign out", "Please try again.");
          }
        },
      },
    ]);
  }, [signOut]);

  const handleTogglePush = useCallback((value: boolean) => {
    setPushEnabled(value);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleToggleEmail = useCallback((value: boolean) => {
    setEmailEnabled(value);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const initials = mockUser.fullName
    ? mockUser.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "?";

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <View className="w-9" />
        <Text className="text-[18px] font-bold tracking-tight text-foreground">
          TradeVidhi
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          className="relative h-9 w-9 items-center justify-center rounded-full"
          accessibilityLabel="Notifications"
        >
          <Bell size={20} strokeWidth={1.5} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View className="items-center px-5 pt-6">
          {/* Avatar */}
          <View className="relative">
            <View className="h-[88px] w-[88px] items-center justify-center rounded-full bg-surface-muted border-[3px] border-outline-subtle">
              <Text className="text-[28px] font-bold text-foreground-muted">
                {initials}
              </Text>
            </View>
            {/* Verified badge */}
            <View className="absolute -bottom-[2px] -right-[2px] h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-surface bg-success">
              <BadgeCheck size={14} strokeWidth={2.5} color="#ffffff" />
            </View>
          </View>

          {/* Name + Phone */}
          <Text className="mt-4 text-[20px] font-bold text-foreground">
            {mockUser.fullName}
          </Text>
          <Text className="mt-[3px] text-[14px] text-foreground-muted">
            {mockUser.phone}
          </Text>

          {/* KYC Badge */}
          <View className="mt-3 flex-row items-center gap-[5px] rounded-full border border-success/30 bg-success/8 px-3 py-[5px]">
            <ShieldCheck size={13} strokeWidth={2} color="#16a34a" />
            <Text className="text-[12px] font-semibold text-success">
              KYC Verified
            </Text>
          </View>
        </View>

        {/* ACCOUNT Section */}
        <SectionHeader title="ACCOUNT" />
        <View className="mx-5 overflow-hidden rounded-2xl border border-outline-subtle bg-surface-elevated">
          <SettingsRow
            icon={<UserPen size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="Edit Profile"
          />
          <View className="mx-4 h-[0.5px] bg-outline-subtle" />
          <SettingsRow
            icon={<ShieldCheck size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="KYC Status"
            trailing={
              <View className="flex-row items-center gap-1">
                <Text className="text-[12px] font-semibold text-success">
                  Completed
                </Text>
                <ChevronRight size={16} strokeWidth={1.8} color="#9b9b9b" />
              </View>
            }
          />
          <View className="mx-4 h-[0.5px] bg-outline-subtle" />
          <SettingsRow
            icon={<Briefcase size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="My Holdings"
            onPress={() => router.push("/(tabs)/market")}
          />
        </View>

        {/* TRADING Section */}
        <SectionHeader title="TRADING" />
        <View className="mx-5 overflow-hidden rounded-2xl border border-outline-subtle bg-surface-elevated">
          <SettingsRow
            icon={<Building2 size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="Broker Connection"
            trailing={
              <View className="flex-row items-center gap-1">
                <View className="rounded-md border border-outline bg-surface-muted px-2 py-[2px]">
                  <Text className="text-[10px] font-semibold text-foreground-subtle">
                    Coming soon
                  </Text>
                </View>
              </View>
            }
          />
          <View className="mx-4 h-[0.5px] bg-outline-subtle" />
          <SettingsRow
            icon={<Bookmark size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="Watchlist"
            onPress={() => router.push("/(tabs)/market")}
          />
        </View>

        {/* NOTIFICATIONS Section */}
        <SectionHeader title="NOTIFICATIONS" />
        <View className="mx-5 overflow-hidden rounded-2xl border border-outline-subtle bg-surface-elevated">
          <View className="flex-row items-center px-4 py-[12px]">
            <View className="h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-surface-muted">
              <BellRing size={16} strokeWidth={1.6} color="#6b6b6b" />
            </View>
            <Text className="ml-3 flex-1 text-[14px] font-medium text-foreground">
              Push Notifications
            </Text>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ false: "#e8e8e8", true: "#F15623" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e8e8e8"
            />
          </View>
          <View className="mx-4 h-[0.5px] bg-outline-subtle" />
          <View className="flex-row items-center px-4 py-[12px]">
            <View className="h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-surface-muted">
              <Mail size={16} strokeWidth={1.6} color="#6b6b6b" />
            </View>
            <Text className="ml-3 flex-1 text-[14px] font-medium text-foreground">
              Email Updates
            </Text>
            <Switch
              value={emailEnabled}
              onValueChange={handleToggleEmail}
              trackColor={{ false: "#e8e8e8", true: "#F15623" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e8e8e8"
            />
          </View>
        </View>

        {/* SECURITY Section */}
        <SectionHeader title="SECURITY" />
        <View className="mx-5 overflow-hidden rounded-2xl border border-outline-subtle bg-surface-elevated">
          <SettingsRow
            icon={<Lock size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="App Lock"
          />
          <View className="mx-4 h-[0.5px] bg-outline-subtle" />
          <SettingsRow
            icon={<Smartphone size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="Change Number"
          />
        </View>

        {/* LEGAL Section */}
        <SectionHeader title="LEGAL" />
        <View className="mx-5 overflow-hidden rounded-2xl border border-outline-subtle bg-surface-elevated">
          <SettingsRow
            icon={<Headphones size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="Support"
          />
          <View className="mx-4 h-[0.5px] bg-outline-subtle" />
          <SettingsRow
            icon={<FileText size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="Terms & Conditions"
          />
          <View className="mx-4 h-[0.5px] bg-outline-subtle" />
          <SettingsRow
            icon={<ShieldAlert size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="Privacy Policy"
          />
          <View className="mx-4 h-[0.5px] bg-outline-subtle" />
          <SettingsRow
            icon={<Scale size={16} strokeWidth={1.6} color="#6b6b6b" />}
            label="SEBI Disclaimer"
          />
        </View>

        {/* Logout */}
        <View className="mx-5 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            className="h-[50px] flex-row items-center justify-center gap-2 rounded-2xl bg-error/8 border border-error/15"
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <LogOut size={17} strokeWidth={1.8} color="#dc2626" />
            <Text className="text-[15px] font-semibold text-error">
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* App version */}
        <Text className="mt-4 text-center text-[11px] text-foreground-subtle">
          TradeVidhi v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
