import { useState, useEffect } from "react";
import { SettingsContent } from "@/components/settings/settings-content";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { DEFAULT_TARGET_INTERVAL, DEFAULT_DAY_START_TIME } from "@/constants/smoking";
import type { Settings } from "@/types/settings.type";

interface SettingsWithAuth extends Settings {
	isGuest: boolean;
}

function useSettingsData() {
	const [settings, setSettings] = useState<SettingsWithAuth | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetchData() {
			setIsLoading(true);
			setError(null);
			try {
				const [settingsJson, authJson] = await Promise.all([api.settings.get(), api.auth.me()]);

				if (!cancelled) {
					const settingsData = settingsJson.settings;
					const user = authJson.user;

					setSettings({
						nickname: settingsData?.nickname ?? null,
						jobType: settingsData?.jobType ?? null,
						enabledModules: settingsData?.enabledModules ?? ["SMOKING"],
						dailySmokingRange: settingsData?.dailySmokingRange ?? null,
						dayStartTime: settingsData?.dayStartTime ?? DEFAULT_DAY_START_TIME,
						currentTargetInterval: settingsData?.currentTargetInterval ?? DEFAULT_TARGET_INTERVAL,
						currentMotivation: settingsData?.currentMotivation ?? null,
						notifyOnTargetTime: settingsData?.notifyOnTargetTime ?? false,
						notifyMorningDelay: settingsData?.notifyMorningDelay ?? false,
						notifyDailyReminder: settingsData?.notifyDailyReminder ?? false,
						isGuest: user?.isGuest ?? true,
					});
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "설정을 불러오는데 실패했습니다");
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

	return { settings, isLoading, error };
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
	const { settings, isLoading, error } = useSettingsData();

	if (isLoading || !settings) {
		return <SettingsSkeleton />;
	}

	if (error) {
		return (
			<div className="flex flex-1 items-center justify-center px-6">
				<p className="text-destructive">{error}</p>
			</div>
		);
	}

	return <SettingsContent settings={settings} />;
}
