import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getUserSettings } from "@/lib/dal";
import { SettingsContent } from "@/components/settings/settings-content";
import SettingsLoading from "./loading";

async function SettingsData({ userId }: { userId: string }) {
	const settings = await getUserSettings(userId);
	return <SettingsContent settings={settings} />;
}

export default async function SettingsPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/onboarding");
	}

	return (
		<Suspense fallback={<SettingsLoading />}>
			<SettingsData userId={user.id} />
		</Suspense>
	);
}
