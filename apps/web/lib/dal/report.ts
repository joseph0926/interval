import { cache } from "react";
import { prisma } from "../db";
import {
	getWeekRangeKST,
	getDateKeyKST,
	getHoursKST,
	isSameDayKST,
	getTodayRangeKST,
} from "../date-utils";
import type {
	ReportData,
	WeeklySummary,
	DailyIntervalData,
	ReasonBreakdown,
	TimePatternData,
} from "@/types/report.type";
import type { ReasonCode } from "@/prisma/generated/prisma/enums";

interface SmokingRecordForReport {
	smokedAt: Date;
	delayedMinutes: number;
	intervalFromPrevious: number | null;
	reasonCode: ReasonCode | null;
}

export const getReportData = cache(async (userId: string): Promise<ReportData> => {
	const thisWeek = getWeekRangeKST(0);
	const lastWeek = getWeekRangeKST(1);

	const [thisWeekRecords, lastWeekRecords] = await Promise.all([
		prisma.smokingRecord.findMany({
			where: {
				userId,
				smokedAt: { gte: thisWeek.start, lt: thisWeek.end },
			},
			orderBy: { smokedAt: "asc" },
			select: {
				smokedAt: true,
				delayedMinutes: true,
				intervalFromPrevious: true,
				reasonCode: true,
			},
		}),
		prisma.smokingRecord.findMany({
			where: {
				userId,
				smokedAt: { gte: lastWeek.start, lt: lastWeek.end },
			},
			orderBy: { smokedAt: "asc" },
			select: {
				intervalFromPrevious: true,
			},
		}),
	]);

	const weeklySummary = calculateWeeklySummary(thisWeekRecords, lastWeekRecords);
	const dailyIntervals = calculateDailyIntervals(thisWeekRecords, thisWeek.start);
	const reasonBreakdown = calculateReasonBreakdown(thisWeekRecords);
	const peakHours = calculatePeakHours(thisWeekRecords);
	const streakDays = await calculateStreakDays(userId);

	return {
		weeklySummary,
		dailyIntervals,
		reasonBreakdown,
		peakHours,
		streakDays,
	};
});

function calculateWeeklySummary(
	thisWeekRecords: SmokingRecordForReport[],
	lastWeekRecords: { intervalFromPrevious: number | null }[],
): WeeklySummary {
	const intervals = thisWeekRecords
		.map((r) => r.intervalFromPrevious)
		.filter((i): i is number => i !== null);

	const averageInterval =
		intervals.length > 0
			? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
			: null;

	const lastWeekIntervals = lastWeekRecords
		.map((r) => r.intervalFromPrevious)
		.filter((i): i is number => i !== null);

	const previousWeekAverageInterval =
		lastWeekIntervals.length > 0
			? Math.round(lastWeekIntervals.reduce((a, b) => a + b, 0) / lastWeekIntervals.length)
			: null;

	const totalDelayMinutes = thisWeekRecords.reduce((sum, r) => sum + r.delayedMinutes, 0);

	const daysWithDelay = new Set(
		thisWeekRecords.filter((r) => r.delayedMinutes > 0).map((r) => getDateKeyKST(r.smokedAt)),
	);

	return {
		averageInterval,
		totalSmoked: thisWeekRecords.length,
		totalDelayMinutes,
		previousWeekAverageInterval,
		hasDelaySuccessDays: daysWithDelay.size,
	};
}

function calculateDailyIntervals(
	records: SmokingRecordForReport[],
	weekStart: Date,
): DailyIntervalData[] {
	const dayNames = ["월", "화", "수", "목", "금", "토", "일"];
	const result: DailyIntervalData[] = [];

	for (let i = 0; i < 7; i++) {
		const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);

		const dayRecords = records.filter((r) => isSameDayKST(r.smokedAt, date));

		const intervals = dayRecords
			.map((r) => r.intervalFromPrevious)
			.filter((i): i is number => i !== null);

		result.push({
			date,
			dayOfWeek: dayNames[i],
			averageInterval:
				intervals.length > 0
					? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
					: null,
			totalSmoked: dayRecords.length,
		});
	}

	return result;
}

function calculateReasonBreakdown(records: SmokingRecordForReport[]): ReasonBreakdown[] {
	const counts = new Map<ReasonCode, number>();

	records.forEach((r) => {
		if (r.reasonCode) {
			counts.set(r.reasonCode, (counts.get(r.reasonCode) ?? 0) + 1);
		}
	});

	const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);

	return Array.from(counts.entries())
		.map(([reasonCode, count]) => ({
			reasonCode,
			count,
			percentage: total > 0 ? Math.round((count / total) * 100) : 0,
		}))
		.sort((a, b) => b.count - a.count);
}

function calculatePeakHours(records: SmokingRecordForReport[]): TimePatternData[] {
	const hourCounts = new Map<number, number>();

	records.forEach((r) => {
		const hour = getHoursKST(r.smokedAt);
		hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
	});

	return Array.from(hourCounts.entries())
		.map(([hour, count]) => ({ hour, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 3);
}

async function calculateStreakDays(userId: string): Promise<number> {
	const records = await prisma.smokingRecord.findMany({
		where: { userId, delayedMinutes: { gt: 0 } },
		orderBy: { smokedAt: "desc" },
		select: { smokedAt: true },
	});

	if (records.length === 0) return 0;

	const uniqueDays = new Set<string>();
	records.forEach((r) => {
		uniqueDays.add(getDateKeyKST(r.smokedAt));
	});

	const sortedDays = Array.from(uniqueDays).sort().reverse();

	let streak = 0;
	const { start: todayStart } = getTodayRangeKST();

	for (let i = 0; i < sortedDays.length; i++) {
		const checkDate = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
		const checkKey = getDateKeyKST(checkDate);

		if (sortedDays.includes(checkKey)) {
			streak++;
		} else {
			break;
		}
	}

	return streak;
}
