import { Redirect } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { View, ActivityIndicator } from "react-native";
import { WebViewScreen } from "@/components/WebViewScreen";
import { COLORS } from "@/lib/theme";

export default function Index() {
	const { isLoading, hasSession } = useSession();

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: COLORS.background,
				}}
			>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		);
	}

	if (!hasSession) return <Redirect href="/onboarding" />;

	return <WebViewScreen path="/" />;
}
