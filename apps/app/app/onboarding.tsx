import { useRef, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { useBridge, BridgeMessage } from "@/lib/bridge";

function getBaseUrl(): string {
	if (!__DEV__) {
		return "https://interval-web.vercel.app";
	}

	if (Platform.OS === "android") {
		return "http://10.0.2.2:3000";
	}

	return "http://localhost:3000";
}

const BASE_URL = getBaseUrl();

export default function OnboardingScreen() {
	const webViewRef = useRef<WebView>(null);
	const { createSession } = useSession();
	const { handleMessage } = useBridge(webViewRef);

	const uri = `${BASE_URL}/onboarding`;

	const injectedJS = `
    (function() {
      window.isNativeApp = true;
      window.nativeAppVersion = "1.0.0";
      true;
    })();
  `;

	const onMessage = useCallback(
		async (event: WebViewMessageEvent) => {
			try {
				const data: BridgeMessage = JSON.parse(event.nativeEvent.data);

				if (data.action === "ONBOARDING_COMPLETE") {
					await createSession();
					router.replace("/(tabs)");
					return;
				}

				handleMessage(data);
			} catch (e) {
				console.error("Failed to parse WebView message:", e);
			}
		},
		[handleMessage, createSession],
	);

	const onNavigationStateChange = useCallback(
		async (navState: { url: string }) => {
			const url = new URL(navState.url);
			if (url.pathname === "/" && !url.pathname.includes("onboarding")) {
				await createSession();
				router.replace("/(tabs)");
			}
		},
		[createSession],
	);

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<WebView
				ref={webViewRef}
				source={{ uri }}
				style={styles.webview}
				injectedJavaScriptBeforeContentLoaded={injectedJS}
				onMessage={onMessage}
				onNavigationStateChange={onNavigationStateChange}
				startInLoadingState
				renderLoading={() => (
					<View style={styles.loading}>
						<ActivityIndicator size="large" color="#000" />
					</View>
				)}
				cacheEnabled
				domStorageEnabled
				javaScriptEnabled
				sharedCookiesEnabled
				mixedContentMode="compatibility"
				onError={(syntheticEvent) => {
					const { nativeEvent } = syntheticEvent;
					console.error("WebView error:", nativeEvent);
				}}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	webview: {
		flex: 1,
	},
	loading: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
});
