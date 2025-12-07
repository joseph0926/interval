import { Redirect } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
	const { isLoading, hasSession } = useSession();

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!hasSession) {
		return <Redirect href="/onboarding" />;
	}

	return <Redirect href="/(tabs)" />;
}
