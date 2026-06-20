import { Text, TouchableOpacity, View } from "react-native";
import { AuthMethod } from "../lib/auth/otp";

type Props = {
  value: AuthMethod;
  onChange: (method: AuthMethod) => void;
};

export default function AuthMethodToggle({ value, onChange }: Props) {
  return (
    <View className="mb-4 flex-row rounded-full bg-[#fff1ec] p-1">
      {(["email", "phone"] as const).map((method) => {
        const selected = value === method;

        return (
          <TouchableOpacity
            key={method}
            activeOpacity={0.9}
            className={`flex-1 rounded-full px-4 py-3 ${
              selected ? "bg-[#F15623]" : "bg-transparent"
            }`}
            onPress={() => onChange(method)}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                selected ? "text-white" : "text-[#7a4a3a]"
              }`}
            >
              {method === "email" ? "Email OTP" : "Phone OTP"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
