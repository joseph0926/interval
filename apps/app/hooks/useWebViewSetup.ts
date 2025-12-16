import { useRef, useCallback } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useBridge, parseBridgeMessage, BridgeMessage } from "@/lib/bridge";

export interface UseWebViewSetupOptions {
	onCustomMessage?: (raw: string) => boolean;
	onBridgeMessage?: (message: BridgeMessage) => boolean;
}

export function useWebViewSetup(options: UseWebViewSetupOptions = {}) {
	const webViewRef = useRef<WebView>(null);
	const { handleMessage, sendToWeb } = useBridge(webViewRef);

	const onMessage = useCallback(
		async (event: WebViewMessageEvent) => {
			const raw = event.nativeEvent.data;

			if (options.onCustomMessage?.(raw)) {
				return;
			}

			const message = parseBridgeMessage(raw);
			if (!message) return;

			if (options.onBridgeMessage?.(message)) {
				return;
			}

			await handleMessage(message);
		},
		[handleMessage, options.onCustomMessage, options.onBridgeMessage],
	);

	const onError = useCallback((syntheticEvent: { nativeEvent: { description?: string } }) => {
		console.error("WebView error:", syntheticEvent.nativeEvent);
	}, []);

	return {
		webViewRef,
		onMessage,
		onError,
		handleMessage,
		sendToWeb,
	};
}
