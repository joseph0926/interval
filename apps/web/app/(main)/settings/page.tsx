import { redirect } from "next/navigation";
import { getCurrentUser, getUserSettings } from "@/lib/dal";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/onboarding");
	}

	const settings = await getUserSettings(user.id);

	return <SettingsContent settings={settings} />;
}
