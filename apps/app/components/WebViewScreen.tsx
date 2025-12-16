import { useRef, useCallback, useMemo, useState } from "react";
import { View, ActivityIndicator, Animated, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useSession } from "@/hooks/useSession";
import { useWebViewSetup } from "@/hooks/useWebViewSetup";
import { CONFIG } from "@/lib/config";
import { COLORS } from "@/lib/theme";
import { WEBVIEW_PROPS, webViewStyles, createInjectedScript } from "@/lib/webview-config";

interface WebViewScreenProps {
	path: string;
}

export function WebViewScreen({ path }: WebViewScreenProps) {
	const insets = useSafeAreaInsets();
	const { sessionId } = useSession();

	const uri = `${CONFIG.BASE_URL}${path}`;

	const [overlayHidden, setOverlayHidden] = useState(false);
	const overlayOpacity = useRef(new Animated.Value(1)).current;
	const didFadeRef = useRef(false);

	const fadeOutOverlay = useCallback(() => {
		if (didFadeRef.current) return;
		didFadeRef.current = true;

		Animated.timing(overlayOpacity, {
			toValue: 0,
			duration: 220,
			useNativeDriver: true,
		}).start(() => setOverlayHidden(true));
	}, [overlayOpacity]);

	const { webViewRef, onMessage, onError } = useWebViewSetup({
		onCustomMessage: (raw) => {
			if (raw === "WEB_READY") {
				fadeOutOverlay();
				return true;
			}
			return false;
		},
	});

	const injectedJS = useMemo(
		() =>
			createInjectedScript({
				sessionId,
				appVersion: CONFIG.APP_VERSION,
				safeAreaInsets: insets,
			}),
		[sessionId, insets],
	);

	const onLoadEnd = useCallback(() => {
		setTimeout(() => fadeOutOverlay(), 500);
	}, [fadeOutOverlay]);

	const handleError = useCallback(
		(syntheticEvent: { nativeEvent: { description?: string } }) => {
			onError(syntheticEvent);
			fadeOutOverlay();
		},
		[onError, fadeOutOverlay],
	);

	return (
		<SafeAreaView
			style={[webViewStyles.container, { backgroundColor: COLORS.background }]}
			edges={["top", "bottom"]}
		>
			<View style={{ flex: 1, backgroundColor: COLORS.background }}>
				<WebView
					ref={webViewRef}
					source={{ uri }}
					style={[webViewStyles.webview, { backgroundColor: "transparent" }]}
					injectedJavaScriptBeforeContentLoaded={injectedJS}
					onMessage={onMessage}
					onLoadEnd={onLoadEnd}
					allowsBackForwardNavigationGestures
					onError={handleError}
					{...WEBVIEW_PROPS}
				/>
				{!overlayHidden && (
					<Animated.View
						pointerEvents="auto"
						style={[
							StyleSheet.absoluteFillObject,
							{
								opacity: overlayOpacity,
								backgroundColor: COLORS.background,
								justifyContent: "center",
								alignItems: "center",
							},
						]}
					>
						<ActivityIndicator size="large" color={COLORS.primary} />
					</Animated.View>
				)}
			</View>
		</SafeAreaView>
	);
}
