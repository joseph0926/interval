import { Platform } from "react-native";
import Constants from "expo-constants";

function getBaseUrl(): string {
	if (!__DEV__) {
		return "https://interval-web.vercel.app";
	}

	if (Platform.OS === "android") {
		return "http://10.0.2.2:5173";
	}

	return "http://localhost:5173";
}

export const CONFIG = {
	BASE_URL: getBaseUrl(),
	APP_VERSION: Constants.expoConfig?.version ?? "1.0.0",
	IS_DEV: __DEV__,
} as const;
