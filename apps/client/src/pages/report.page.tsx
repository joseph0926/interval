import { useState, useEffect, useMemo } from "react";
import { ReportContent } from "@/components/report/report-content";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { transformReportData } from "@/lib/report-utils";

function useReportData() {
	const [weeklyData, setWeeklyData] = useState<Awaited<
		ReturnType<typeof api.report.weekly>
	> | null>(null);
	const [streakData, setStreakData] = useState<Awaited<
		ReturnType<typeof api.report.streak>
	> | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function fetchData() {
			setIsLoading(true);
			try {
				const [weekly, streak] = await Promise.all([api.report.weekly(), api.report.streak()]);
				if (!cancelled) {
					setWeeklyData(weekly);
					setStreakData(streak);
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

	const reportData = useMemo(
		() => transformReportData(weeklyData?.data, streakData?.data),
		[weeklyData, streakData],
	);

	return { data: reportData, isLoading };
}

function ReportSkeleton() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="px-6 pt-12">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="mt-2 h-6 w-48" />
			</div>
			<div className="flex flex-col gap-4 px-6 py-6">
				<Skeleton className="h-28 w-full rounded-xl" />
				<Skeleton className="h-44 w-full rounded-xl" />
				<Skeleton className="h-36 w-full rounded-xl" />
				<Skeleton className="h-24 w-full rounded-xl" />
			</div>
		</div>
	);
}

export function ReportPage() {
	const { data, isLoading } = useReportData();

	if (isLoading) {
		return <ReportSkeleton />;
	}

	return <ReportContent data={data} />;
}
