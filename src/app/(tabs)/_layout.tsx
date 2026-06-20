import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import * as Haptics from "expo-haptics";
import {
  LayoutDashboard,
  Lightbulb,
  ArrowLeftRight,
  User,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { useCallback, useEffect } from "react";

const ACTIVE_COLOR = "#F15623";
const INACTIVE_COLOR = "#9b9b9b";
const TAB_BAR_BG = "#ffffff";
const INDICATOR_SIZE = 4;

const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.8,
};

function TabIcon({
  Icon,
  focused,
  label,
}: {
  Icon: typeof LayoutDashboard;
  focused: boolean;
  label: string;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 1, springConfig);
    translateY.value = withSpring(focused ? -1 : 0, springConfig);
    opacity.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  return (
    <View className="items-center justify-center pt-2">
      <Animated.View style={iconStyle}>
        <Icon
          size={22}
          strokeWidth={focused ? 2 : 1.5}
          color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
      </Animated.View>
      <Animated.Text
        style={[
          {
            fontSize: 10,
            marginTop: 4,
            fontFamily: "Inter-Medium",
            color: focused ? ACTIVE_COLOR : INACTIVE_COLOR,
            letterSpacing: 0.1,
          },
        ]}
      >
        {label}
      </Animated.Text>
      <Animated.View
        style={[
          dotStyle,
          {
            width: INDICATOR_SIZE,
            height: INDICATOR_SIZE,
            borderRadius: INDICATOR_SIZE / 2,
            backgroundColor: ACTIVE_COLOR,
            marginTop: 3,
          },
        ]}
      />
    </View>
  );
}

export default function TabsLayout() {
  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_BAR_BG,
          borderTopWidth: 0.5,
          borderTopColor: "#f0f0f0",
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 4,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.03,
          shadowRadius: 4,
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      screenListeners={{
        tabPress: () => {
          runOnJS(triggerHaptic)();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={LayoutDashboard} focused={focused} label="Dashboard" />
          ),
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Lightbulb} focused={focused} label="Ideas" />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={ArrowLeftRight} focused={focused} label="Market" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={User} focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}
