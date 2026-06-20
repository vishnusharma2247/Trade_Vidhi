import { Text, Pressable, View } from "react-native";
import { SlidersHorizontal } from "lucide-react-native";

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onPress: () => void;
  variant?: "dot" | "icon";
  dotColor?: string;
}

export default function FilterChip({
  label,
  isActive = false,
  onPress,
  variant = "dot",
  dotColor,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-lg border px-3 py-[7px] ${
        isActive
          ? "border-primary/30 bg-primary-light"
          : "border-outline bg-surface-elevated"
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      {variant === "dot" && dotColor && (
        <View
          className="mr-[6px] h-[7px] w-[7px] rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {variant === "icon" && (
        <SlidersHorizontal
          size={14}
          strokeWidth={1.8}
          color={isActive ? "#F15623" : "#6b6b6b"}
          className="mr-[5px]"
        />
      )}
      <Text
        className={`text-[13px] font-medium ${
          isActive ? "text-primary" : "text-foreground"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
