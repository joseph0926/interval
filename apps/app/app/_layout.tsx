import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { COLORS } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
	useEffect(() => {
		const timer = setTimeout(() => {
			SplashScreen.hideAsync().catch(() => {});
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	return (
		<ErrorBoundary>
			<SafeAreaProvider>
				<View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
				</View>
			</SafeAreaProvider>
		</ErrorBoundary>
	);
}
