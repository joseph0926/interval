import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { COLORS } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	return (
		<ErrorBoundary>
			<SafeAreaProvider>
				<StatusBar style="light" backgroundColor={COLORS.background} />
				<Stack
					screenOptions={{
						headerShown: false,
						animation: "fade",
						contentStyle: { backgroundColor: COLORS.background },
					}}
				>
					<Stack.Screen name="index" />
					<Stack.Screen name="onboarding" />
				</Stack>
			</SafeAreaProvider>
		</ErrorBoundary>
	);
}
