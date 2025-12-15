import { Redirect } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { WebViewScreen } from "@/components/WebViewScreen";

export default function Index() {
	const { isLoading, hasSession } = useSession();

	if (isLoading) return null;

	if (!hasSession) {
		return <Redirect href="/onboarding" />;
	}

	return <WebViewScreen path="/" />;
}
