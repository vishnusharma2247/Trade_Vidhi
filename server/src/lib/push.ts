import { Expo } from "expo-server-sdk";
import { env } from "../env.js";

export const expo = new Expo({
  accessToken: env.EXPO_ACCESS_TOKEN,
});
