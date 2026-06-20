import React from "react";
import { View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function AuthCard({ children }: Props) {
  return (
    <View className="self-center w-[94%] max-w-md mt-10 bg-white rounded-3xl p-8 shadow-md">
      {children}
    </View>
  );
}
