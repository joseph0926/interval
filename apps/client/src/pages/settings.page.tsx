import { use, Suspense } from "react";
import { SettingsContent } from "@/components/settings/settings-content";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { UserSettings } from "@/types/settings.type";

async function fetchSettings(): Promise<UserSettings> {
	const [settingsRes, authRes] = await Promise.all([
		api.api.settings.$get(),
		api.api.auth.me.$get(),
	]);

	const settingsJson = await settingsRes.json();
	const authJson = await authRes.json();

	const settings = settingsJson.settings;
	const user = authJson.user;

	return {
		targetInterval: settings?.currentTargetInterval ?? 60,
		motivation: settings?.currentMotivation ?? null,
		notificationEnabled: settings?.notifyOnTargetTime ?? false,
		morningReminderEnabled: settings?.notifyMorningDelay ?? false,
		isGuest: user?.isGuest ?? true,
	};
}

const settingsPromise = fetchSettings();

function SettingsDataLoader() {
	const settings = use(settingsPromise);
	return <SettingsContent settings={settings} />;
}

function SettingsSkeleton() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="px-6 pt-12">
				<Skeleton className="h-6 w-24" />
				<Skeleton className="mt-2 h-4 w-40" />
			</div>
			<div className="flex flex-col gap-4 px-6 py-6">
				<Skeleton className="h-48 w-full rounded-xl" />
				<Skeleton className="h-36 w-full rounded-xl" />
				<Skeleton className="h-32 w-full rounded-xl" />
				<Skeleton className="h-24 w-full rounded-xl" />
				<Skeleton className="h-20 w-full rounded-xl" />
			</div>
		</div>
	);
}

export function SettingsPage() {
	return (
		<Suspense fallback={<SettingsSkeleton />}>
			<SettingsDataLoader />
		</Suspense>
	);
}
