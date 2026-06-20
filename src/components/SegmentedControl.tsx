import { View, Text, Pressable, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useCallback, useState } from "react";

interface SegmentedControlProps {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

const springConfig = { damping: 18, stiffness: 180 };

export default function SegmentedControl({
  segments,
  activeIndex,
  onChange,
}: SegmentedControlProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  const segmentWidth = containerWidth / segments.length;

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      setContainerWidth(width);
      translateX.value = activeIndex * (width / segments.length);
    },
    [segments.length, activeIndex]
  );

  const handlePress = useCallback(
    (index: number) => {
      translateX.value = withSpring(index * segmentWidth, springConfig);
      onChange(index);
    },
    [segmentWidth, onChange]
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth,
  }));

  return (
    <View
      onLayout={onLayout}
      className="relative h-[44px] flex-row items-center rounded-xl bg-surface-muted p-[3px]"
    >
      {containerWidth > 0 && (
        <Animated.View
          style={indicatorStyle}
          className="absolute left-[3px] top-[3px] h-[38px] rounded-[10px] bg-surface-elevated shadow-sm"
        />
      )}

      {segments.map((segment, index) => (
        <Pressable
          key={segment}
          onPress={() => handlePress(index)}
          className="flex-1 items-center justify-center"
          accessibilityRole="tab"
          accessibilityState={{ selected: index === activeIndex }}
        >
          <Text
            className={`text-[14px] font-semibold ${
              index === activeIndex
                ? "text-foreground"
                : "text-foreground-muted"
            }`}
          >
            {segment}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
