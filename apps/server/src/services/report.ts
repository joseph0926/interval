import { prisma } from "../lib/prisma.js";
import { getWeekRange, getTodayDateString, formatHourLabel } from "../lib/date.js";
import { REASON_LABELS, DELAY_SUCCESS_THRESHOLD_MINUTES } from "../lib/constants.js";
import type {
	WeeklyReportData,
	StreakData,
	InsightData,
	ReasonCode,
	DistanceBank,
} from "../types/index.js";

export async function getWeeklyReport(userId: string): Promise<WeeklyReportData> {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
	});

	const { start, end } = getWeekRange(user.dayStartTime);

	const [records, delayLogs] = await Promise.all([
		prisma.smokingRecord.findMany({
			where: {
				userId,
				smokedAt: { gte: start, lt: end },
			},
			orderBy: { smokedAt: "asc" },
		}),
		prisma.delayLog.findMany({
			where: {
				userId,
				date: {
					gte: start.toISOString().split("T")[0],
					lte: end.toISOString().split("T")[0],
				},
			},
		}),
	]);

	const totalSmoked = records.length;
	const totalDelayMinutes = delayLogs.reduce(
		(sum: number, log: { minutes: number }) => sum + log.minutes,
		0,
	);

	const intervals = records
		.map((r: { intervalFromPrevious: number | null }) => r.intervalFromPrevious)
		.filter((i): i is number => i !== null);

	const avgInterval =
		intervals.length > 0
			? Math.round(intervals.reduce((a: number, b: number) => a + b, 0) / intervals.length)
			: null;

	const delaySuccessDays = delayLogs.filter(
		(log: { minutes: number }) => log.minutes >= DELAY_SUCCESS_THRESHOLD_MINUTES,
	).length;

	const reasonCounts: Record<string, number> = {};
	const hourCounts: Record<
		number,
		{ count: number; totalInterval: number; intervalCount: number }
	> = {};

	for (const record of records) {
		if (record.reasonCode) {
			reasonCounts[record.reasonCode] = (reasonCounts[record.reasonCode] || 0) + 1;
		}

		const hour = record.smokedAt.getHours();
		if (!hourCounts[hour]) {
			hourCounts[hour] = { count: 0, totalInterval: 0, intervalCount: 0 };
		}
		hourCounts[hour].count++;
		if (record.intervalFromPrevious !== null) {
			hourCounts[hour].totalInterval += record.intervalFromPrevious;
			hourCounts[hour].intervalCount++;
		}
	}

	const topReasons = Object.entries(reasonCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([reason, count]) => ({
			reason: reason as ReasonCode,
			label: REASON_LABELS[reason as ReasonCode] ?? reason,
			count,
			percentage: totalSmoked > 0 ? Math.round((count / totalSmoked) * 100) : 0,
		}));

	const peakHours = Object.entries(hourCounts)
		.sort((a, b) => b[1].count - a[1].count)
		.slice(0, 5)
		.map(([hourStr, data]) => {
			const hour = parseInt(hourStr, 10);
			return {
				hour,
				label: formatHourLabel(hour),
				count: data.count,
				avgInterval:
					data.intervalCount > 0 ? Math.round(data.totalInterval / data.intervalCount) : null,
			};
		});

	const bestHour =
		peakHours.length > 0
			? peakHours.reduce((best, curr) =>
					(curr.avgInterval ?? 0) > (best.avgInterval ?? 0) ? curr : best,
				)
			: null;

	const worstHour =
		peakHours.length > 0
			? peakHours.reduce((worst, curr) =>
					(curr.avgInterval ?? Infinity) < (worst.avgInterval ?? Infinity) ? curr : worst,
				)
			: null;

	const dailyStatsMap = new Map<
		string,
		{ totalSmoked: number; totalInterval: number; intervalCount: number; totalDelay: number }
	>();

	for (const record of records) {
		const dateStr = record.smokedAt.toISOString().split("T")[0];
		if (!dailyStatsMap.has(dateStr)) {
			dailyStatsMap.set(dateStr, {
				totalSmoked: 0,
				totalInterval: 0,
				intervalCount: 0,
				totalDelay: 0,
			});
		}
		const stats = dailyStatsMap.get(dateStr)!;
		stats.totalSmoked++;
		if (record.intervalFromPrevious !== null) {
			stats.totalInterval += record.intervalFromPrevious;
			stats.intervalCount++;
		}
	}

	for (const log of delayLogs) {
		if (dailyStatsMap.has(log.date)) {
			dailyStatsMap.get(log.date)!.totalDelay = log.minutes;
		} else {
			dailyStatsMap.set(log.date, {
				totalSmoked: 0,
				totalInterval: 0,
				intervalCount: 0,
				totalDelay: log.minutes,
			});
		}
	}

	const dailyStats = Array.from(dailyStatsMap.entries())
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([date, stats]) => ({
			date,
			totalSmoked: stats.totalSmoked,
			averageInterval:
				stats.intervalCount > 0 ? Math.round(stats.totalInterval / stats.intervalCount) : null,
			totalDelayMinutes: stats.totalDelay,
		}));

	const distanceBank = await getDistanceBank(userId, user.dayStartTime);

	return {
		summary: {
			avgInterval,
			intervalChange: null,
			totalDelayMinutes,
			totalSmoked,
			delaySuccessDays,
		},
		patterns: {
			topReasons,
			peakHours,
			bestHour,
			worstHour,
		},
		dailyStats,
		distanceBank,
	};
}

async function getDistanceBank(userId: string, dayStartTime: string): Promise<DistanceBank> {
	const todayStr = getTodayDateString(dayStartTime);
	const { start: weekStart, end: weekEnd } = getWeekRange(dayStartTime);

	const [todayLog, weekLogs, allLogs] = await Promise.all([
		prisma.delayLog.findUnique({
			where: { userId_date: { userId, date: todayStr } },
		}),
		prisma.delayLog.findMany({
			where: {
				userId,
				date: {
					gte: weekStart.toISOString().split("T")[0],
					lte: weekEnd.toISOString().split("T")[0],
				},
			},
		}),
		prisma.delayLog.findMany({
			where: { userId },
		}),
	]);

	return {
		today: todayLog?.minutes ?? 0,
		thisWeek: weekLogs.reduce((sum, log) => sum + log.minutes, 0),
		total: allLogs.reduce((sum, log) => sum + log.minutes, 0),
	};
}

export async function getStreak(userId: string): Promise<StreakData> {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
	});

	const delayLogs = await prisma.delayLog.findMany({
		where: { userId },
		orderBy: { date: "desc" },
	});

	const successDates = new Set(
		delayLogs
			.filter((log: { minutes: number }) => log.minutes >= DELAY_SUCCESS_THRESHOLD_MINUTES)
			.map((log: { date: string }) => log.date),
	);

	let currentStreak = 0;
	let longestStreak = 0;
	let streak = 0;

	const todayStr = getTodayDateString(user.dayStartTime);
	const checkDate = new Date(todayStr);

	for (let i = 0; i < 365; i++) {
		const dateStr = checkDate.toISOString().split("T")[0];
		if (successDates.has(dateStr)) {
			streak++;
			if (i === 0 || streak > 1) {
				currentStreak = streak;
			}
		} else {
			if (streak > longestStreak) {
				longestStreak = streak;
			}
			streak = 0;
			if (i > 0) break;
		}
		checkDate.setDate(checkDate.getDate() - 1);
	}

	if (streak > longestStreak) {
		longestStreak = streak;
	}

	return { currentStreak, longestStreak };
}

export async function getInsight(userId: string): Promise<InsightData> {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
	});

	const { start, end } = getWeekRange(user.dayStartTime);

	const records = await prisma.smokingRecord.findMany({
		where: {
			userId,
			smokedAt: { gte: start, lt: end },
		},
	});

	if (records.length === 0) {
		return {
			message: "이번 주 기록이 없습니다. 첫 기록을 시작해보세요!",
			suggestion: "목표 간격을 설정하고 천천히 시작해보세요.",
			peakHour: null,
			topReason: null,
		};
	}

	const reasonCounts: Record<string, number> = {};
	const hourCounts: Record<number, number> = {};

	for (const record of records) {
		if (record.reasonCode) {
			reasonCounts[record.reasonCode] = (reasonCounts[record.reasonCode] || 0) + 1;
		}
		const hour = record.smokedAt.getHours();
		hourCounts[hour] = (hourCounts[hour] || 0) + 1;
	}

	const topReasonEntry = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
	const peakHourEntry = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

	const topReason = topReasonEntry
		? {
				reason: topReasonEntry[0] as ReasonCode,
				label: REASON_LABELS[topReasonEntry[0] as ReasonCode] ?? topReasonEntry[0],
				count: topReasonEntry[1],
			}
		: null;

	const peakHour = peakHourEntry
		? {
				hour: parseInt(peakHourEntry[0], 10),
				label: formatHourLabel(parseInt(peakHourEntry[0], 10)),
				count: peakHourEntry[1],
			}
		: null;

	let message = "";
	let suggestion = "";

	if (topReason) {
		switch (topReason.reason) {
			case "STRESS":
				message = `이번 주 '${topReason.label}' 때문에 ${topReason.count}번 흡연하셨네요.`;
				suggestion = "스트레스를 받을 때 심호흡을 3번 해보세요.";
				break;
			case "BORED":
				message = `'${topReason.label}' 때 흡연이 ${topReason.count}번 있었어요.`;
				suggestion = "지루할 때 짧은 산책이나 물 마시기를 시도해보세요.";
				break;
			case "HABIT":
				message = `습관적 흡연이 ${topReason.count}번 기록되었어요.`;
				suggestion = "흡연 전 30초 멈추기로 의식적인 선택을 해보세요.";
				break;
			default:
				message = `'${topReason.label}'이(가) 가장 많은 흡연 이유입니다.`;
				suggestion = "그 순간을 인식하고 잠시 미루기를 시도해보세요.";
		}
	} else {
		message = "이번 주 기록을 분석 중입니다.";
		suggestion = "흡연 이유를 기록하면 더 정확한 분석이 가능해요.";
	}

	return { message, suggestion, peakHour, topReason };
}
