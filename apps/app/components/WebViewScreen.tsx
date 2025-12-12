import { useRef, useCallback, useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/hooks/useSession";
import { useBridge, parseBridgeMessage } from "@/lib/bridge";
import { CONFIG } from "@/lib/config";
import { COLORS } from "@/lib/theme";
import { WEBVIEW_PROPS, webViewStyles, createInjectedScript } from "@/lib/webview-config";

interface WebViewScreenProps {
	path: string;
}

export function WebViewScreen({ path }: WebViewScreenProps) {
	const webViewRef = useRef<WebView>(null);
	const { sessionId } = useSession();
	const { handleMessage } = useBridge(webViewRef);

	const uri = `${CONFIG.BASE_URL}${path}`;

	const injectedJS = useMemo(
		() =>
			createInjectedScript({
				sessionId,
				appVersion: CONFIG.APP_VERSION,
			}),
		[sessionId],
	);

	const onMessage = useCallback(
		(event: WebViewMessageEvent) => {
			const message = parseBridgeMessage(event.nativeEvent.data);
			if (message) {
				handleMessage(message);
			}
		},
		[handleMessage],
	);

	const renderLoading = useCallback(
		() => (
			<View style={webViewStyles.loading}>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		),
		[],
	);

	const onError = useCallback((syntheticEvent: { nativeEvent: { description?: string } }) => {
		console.error("WebView error:", syntheticEvent.nativeEvent);
	}, []);

	return (
		<SafeAreaView style={webViewStyles.container} edges={["top"]}>
			<WebView
				ref={webViewRef}
				source={{ uri }}
				style={webViewStyles.webview}
				injectedJavaScriptBeforeContentLoaded={injectedJS}
				onMessage={onMessage}
				startInLoadingState
				renderLoading={renderLoading}
				allowsBackForwardNavigationGestures
				onError={onError}
				{...WEBVIEW_PROPS}
			/>
		</SafeAreaView>
	);
}
