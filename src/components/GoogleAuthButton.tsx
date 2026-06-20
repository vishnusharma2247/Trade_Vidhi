import { Text, TouchableOpacity } from "react-native";

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
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled}
      className="mt-4 h-14 flex-row items-center justify-center rounded-full border border-rose-200 bg-white px-6"
      onPress={onPress}
    >
      <Text className="mr-3 text-2xl font-bold text-[#4285F4]">G</Text>
      <Text className="text-base font-medium text-gray-800">{label}</Text>
    </TouchableOpacity>
  );
}
