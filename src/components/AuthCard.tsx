import React from "react";
import { View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function AuthCard({ children }: Props) {
  return (
    <View className="mt-8 w-full rounded-2xl bg-surface-elevated px-6 py-8 shadow-md">
      {children}
    </View>
  );
}
