import { Platform, View } from "react-native";

export default function ClerkCaptchaContainer() {
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View className="mt-4 overflow-hidden rounded-xl bg-surface-muted px-4 py-3">
      <div id="clerk-captcha" />
    </View>
  );
}
