import { useRef, useCallback, useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { useBridge, parseBridgeMessage, BRIDGE_ACTIONS } from "@/lib/bridge";
import { CONFIG } from "@/lib/config";
import { COLORS } from "@/lib/theme";
import { WEBVIEW_PROPS, webViewStyles, createOnboardingInjectedScript } from "@/lib/webview-config";

export default function OnboardingScreen() {
	const webViewRef = useRef<WebView>(null);
	const { createSession } = useSession();
	const { handleMessage } = useBridge(webViewRef);

	const uri = `${CONFIG.BASE_URL}/onboarding`;

	const injectedJS = useMemo(() => createOnboardingInjectedScript(CONFIG.APP_VERSION), []);

	const handleOnboardingComplete = useCallback(async () => {
		await createSession();
		router.replace("/");
	}, [createSession]);

	const onMessage = useCallback(
		async (event: WebViewMessageEvent) => {
			const message = parseBridgeMessage(event.nativeEvent.data);
			if (!message) {
				return;
			}

			if (message.action === BRIDGE_ACTIONS.ONBOARDING_COMPLETE) {
				await handleOnboardingComplete();
				return;
			}

			handleMessage(message);
		},
		[handleMessage, handleOnboardingComplete],
	);

	const onNavigationStateChange = useCallback(
		async (navState: { url: string }) => {
			try {
				const url = new URL(navState.url);
				const isMainPage = url.pathname === "/" || url.pathname === "/home";
				const isNotOnboarding = !url.pathname.includes("onboarding");

				if (isMainPage && isNotOnboarding) {
					await handleOnboardingComplete();
				}
			} catch {
				// Invalid URL, ignore
			}
		},
		[handleOnboardingComplete],
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
				onNavigationStateChange={onNavigationStateChange}
				startInLoadingState
				renderLoading={renderLoading}
				onError={onError}
				{...WEBVIEW_PROPS}
			/>
		</SafeAreaView>
	);
}
