import { StyleSheet } from "react-native";
import { COLORS } from "./theme";

type SafeAreaInsets = { top: number; bottom: number; left: number; right: number };

export const WEBVIEW_PROPS = {
	cacheEnabled: true,
	domStorageEnabled: true,
	javaScriptEnabled: true,
	sharedCookiesEnabled: true,
	mixedContentMode: "compatibility" as const,
} as const;

export const webViewStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
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
		backgroundColor: COLORS.background,
	},
});

export function createInjectedScript(params: {
	sessionId?: string | null;
	appVersion: string;
	safeAreaInsets: SafeAreaInsets;
}): string {
	const { sessionId, appVersion, safeAreaInsets } = params;

	return `
		(function() {
      var root = document.documentElement;

      root.style.setProperty('--safe-top', '${safeAreaInsets.top}px');
      root.style.setProperty('--safe-bottom', '${safeAreaInsets.bottom}px');
      root.style.setProperty('--safe-left', '${safeAreaInsets.left}px');
      root.style.setProperty('--safe-right', '${safeAreaInsets.right}px');

			window.isNativeApp = true;
			window.nativeAppVersion = ${JSON.stringify(appVersion)};
			window.sessionId = ${JSON.stringify(sessionId ?? "")};

			window.addEventListener('nativeMessage', function(e) {
				console.log('Message from native:', e.detail);
			});

			true;
		})();
	`;
}

export function createOnboardingInjectedScript(appVersion: string): string {
	return `
		(function() {
			window.isNativeApp = true;
			window.nativeAppVersion = ${JSON.stringify(appVersion)};
			true;
		})();
	`;
}
