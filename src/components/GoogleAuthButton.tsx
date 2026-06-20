import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";

type Props = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

export default function GoogleAuthButton({
  disabled = false,
  label,
  onPress,
}: Props) {
  const isLoading = label.toLowerCase().includes("connecting");

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      className={`mt-4 h-[52px] flex-row items-center justify-center rounded-full border border-outline bg-surface-elevated ${disabled ? "opacity-50" : ""}`}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <View className="mr-3 h-5 w-5 items-center justify-center">
          <Text className="text-lg font-bold text-[#4285F4]">G</Text>
        </View>
      )}
      <Text className="text-[15px] font-medium text-foreground">{label}</Text>
    </TouchableOpacity>
  );
}
