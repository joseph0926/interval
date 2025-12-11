import type { ReportData, DailyIntervalData } from "@/types/report.type";
import type { WeeklyReportData, StreakData } from "@/lib/api-types";

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"];

export function transformReportData(
	weeklyData: WeeklyReportData | null | undefined,
	streakData: StreakData | null | undefined,
): ReportData {
	const dailyIntervals: DailyIntervalData[] =
		weeklyData?.dailyStats?.map((stat, index) => ({
			date: stat.date,
			dayOfWeek: DAYS_OF_WEEK[index] ?? "?",
			averageInterval: stat.averageInterval ? Math.round(stat.averageInterval) : null,
			totalSmoked: stat.totalSmoked,
		})) ??
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
			weeklyData?.patterns?.topReasons?.map((r) => ({
				reasonCode: r.reason,
				count: r.count,
				percentage: Math.round(r.percentage),
			})) ?? [],
		peakHours:
			weeklyData?.patterns?.peakHours?.map((h) => ({
				hour: h.hour,
				count: h.count,
			})) ?? [],
		streakDays: streakData?.currentStreak ?? 0,
	};
}
