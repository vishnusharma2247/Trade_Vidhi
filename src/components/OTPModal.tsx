import React from "react";
import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import OTPInput from "./OTPInput";

type Props = {
  visible: boolean;
  contactLabel?: string;
  onClose?: () => void;
  onComplete?: (code: string) => void;
};

export default function OTPModal({ visible, contactLabel, onClose, onComplete }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} activeOpacity={1} onPress={onClose} />

          <View className="bg-white rounded-2xl p-6 w-[92%] max-w-md shadow-lg">
            <Text className="text-2xl font-extrabold text-center">Verify Details</Text>
            {contactLabel ? (
              <Text className="text-center text-sm text-gray-600 mt-2">OTP sent to {contactLabel}</Text>
            ) : null}

            <OTPInput length={6} onComplete={(code) => onComplete?.(code)} />

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onClose}
              className="mt-6 bg-gray-200 h-12 rounded-full items-center justify-center"
            >
              <Text className="text-lg font-semibold text-gray-700">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
