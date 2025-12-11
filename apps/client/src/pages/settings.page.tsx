import { useState, useEffect } from "react";
import { SettingsContent } from "@/components/settings/settings-content";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { DEFAULT_TARGET_INTERVAL } from "@/constants/smoking";
import type { UserSettings } from "@/types/settings.type";

function useSettingsData() {
	const [settings, setSettings] = useState<UserSettings | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function fetchData() {
			setIsLoading(true);
			try {
				const [settingsJson, authJson] = await Promise.all([api.settings.get(), api.auth.me()]);

				if (!cancelled) {
					const settingsData = settingsJson.settings;
					const user = authJson.user;

					setSettings({
						targetInterval: settingsData?.currentTargetInterval ?? DEFAULT_TARGET_INTERVAL,
						motivation: settingsData?.currentMotivation ?? null,
						notificationEnabled: settingsData?.notifyOnTargetTime ?? false,
						morningReminderEnabled: settingsData?.notifyMorningDelay ?? false,
						isGuest: user?.isGuest ?? true,
					});
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchData();
		return () => {
			cancelled = true;
		};
	}, []);

	return { settings, isLoading };
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
	const { settings, isLoading } = useSettingsData();

	if (isLoading || !settings) {
		return <SettingsSkeleton />;
	}

	return <SettingsContent settings={settings} />;
}
