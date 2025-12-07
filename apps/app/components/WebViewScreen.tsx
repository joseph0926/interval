import { useRef, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/hooks/useSession";
import { useBridge, BridgeMessage } from "@/lib/bridge";

function getBaseUrl(): string {
	if (!__DEV__) {
		return "https://your-production-url.com";
	}

	if (Platform.OS === "android") {
		return "http://10.0.2.2:3000";
	}

	return "http://localhost:3000";
}

const BASE_URL = getBaseUrl();

interface WebViewScreenProps {
	path: string;
}

export function WebViewScreen({ path }: WebViewScreenProps) {
	const webViewRef = useRef<WebView>(null);
	const { sessionId } = useSession();
	const { handleMessage, sendToWeb } = useBridge(webViewRef);

	const uri = `${BASE_URL}${path}`;

	const injectedJS = `
    (function() {
      window.isNativeApp = true;
      window.nativeAppVersion = "1.0.0";
      window.sessionId = "${sessionId || ""}";
      
      
      window.addEventListener('nativeMessage', function(e) {
        console.log('Message from native:', e.detail);
      });
      
      true;
    })();
  `;

	const onMessage = useCallback(
		(event: WebViewMessageEvent) => {
			try {
				const data: BridgeMessage = JSON.parse(event.nativeEvent.data);
				handleMessage(data);
			} catch (e) {
				console.error("Failed to parse WebView message:", e);
			}
		},
		[handleMessage],
	);

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<WebView
				ref={webViewRef}
				source={{ uri }}
				style={styles.webview}
				injectedJavaScriptBeforeContentLoaded={injectedJS}
				onMessage={onMessage}
				startInLoadingState
				renderLoading={() => (
					<View style={styles.loading}>
						<ActivityIndicator size="large" color="#000" />
					</View>
				)}
				cacheEnabled
				domStorageEnabled
				javaScriptEnabled
				allowsBackForwardNavigationGestures
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
