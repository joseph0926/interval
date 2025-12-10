import { use, Suspense } from "react";
import { ReportContent } from "@/components/report/report-content";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { ReportData, DailyIntervalData } from "@/types/report.type";
import type { ReasonCode } from "@/types/smoking.type";

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"];

async function fetchReportData(): Promise<ReportData> {
	const [weeklyRes, streakRes] = await Promise.all([
		api.api.report.weekly.$get(),
		api.api.report.streak.$get(),
	]);

	const weeklyJson = await weeklyRes.json();
	const streakJson = await streakRes.json();

	const weeklyData = weeklyJson.data;
	const streakData = streakJson.data;

	const dailyIntervals: DailyIntervalData[] =
		weeklyData?.dailyStats?.map(
			(
				stat: { date: string; averageInterval: number | null; totalSmoked: number },
				index: number,
			) => ({
				date: stat.date,
				dayOfWeek: DAYS_OF_WEEK[index] ?? "?",
				averageInterval: stat.averageInterval ? Math.round(stat.averageInterval) : null,
				totalSmoked: stat.totalSmoked,
			}),
		) ??
		DAYS_OF_WEEK.map((day) => ({
			date: "",
			dayOfWeek: day,
			averageInterval: null,
			totalSmoked: 0,
		}));

	return {
		weeklySummary: {
			averageInterval: weeklyData?.summary?.avgInterval
				? Math.round(weeklyData.summary.avgInterval)
				: null,
			totalSmoked: weeklyData?.summary?.totalSmoked ?? 0,
			totalDelayMinutes: weeklyData?.summary?.totalDelayMinutes ?? 0,
			previousWeekAverageInterval: weeklyData?.summary?.intervalChange
				? Math.round((weeklyData.summary.avgInterval ?? 0) - weeklyData.summary.intervalChange)
				: null,
			hasDelaySuccessDays: weeklyData?.summary?.delaySuccessDays ?? 0,
		},
		dailyIntervals,
		reasonBreakdown:
			weeklyData?.patterns?.topReasons?.map(
				(r: { reason: string; count: number; percentage: number }) => ({
					reasonCode: r.reason as ReasonCode,
					count: r.count,
					percentage: Math.round(r.percentage),
				}),
			) ?? [],
		peakHours:
			weeklyData?.patterns?.peakHours?.map((h: { hour: string; count: number }) => ({
				hour: parseInt(h.hour.split("-")[0], 10),
				count: h.count,
			})) ?? [],
		streakDays: streakData?.currentStreak ?? 0,
	};
}

const reportDataPromise = fetchReportData();

function ReportDataLoader() {
	const data = use(reportDataPromise);
	return <ReportContent data={data} />;
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
	return (
		<Suspense fallback={<ReportSkeleton />}>
			<ReportDataLoader />
		</Suspense>
	);
}
