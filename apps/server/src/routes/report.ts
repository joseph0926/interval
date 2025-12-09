import { Hono } from "hono";
import { db } from "../lib/db";
import { authMiddleware } from "../middleware/auth";
import { Errors } from "../lib/errors";

function getKSTStartOfDay(dateStr: string): Date {
	return new Date(`${dateStr}T00:00:00+09:00`);
}

function getKSTEndOfDay(dateStr: string): Date {
	return new Date(`${dateStr}T23:59:59.999+09:00`);
}

function getWeekRange(weeksAgo: number = 0) {
	const now = new Date();
	const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

	const dayOfWeek = kstNow.getUTCDay();
	const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	const monday = new Date(kstNow);
	monday.setUTCDate(monday.getUTCDate() - daysToMonday - weeksAgo * 7);

	const sunday = new Date(monday);
	sunday.setUTCDate(monday.getUTCDate() + 6);

	return {
		start: getKSTStartOfDay(monday.toISOString().split("T")[0]),
		end: getKSTEndOfDay(sunday.toISOString().split("T")[0]),
	};
}

function getHourBucket(date: Date): string {
	const hour = new Date(date.getTime() + 9 * 60 * 60 * 1000).getUTCHours();

	if (hour >= 6 && hour < 9) return "06-09";
	if (hour >= 9 && hour < 12) return "09-12";
	if (hour >= 12 && hour < 15) return "12-15";
	if (hour >= 15 && hour < 18) return "15-18";
	if (hour >= 18 && hour < 21) return "18-21";
	if (hour >= 21 || hour < 6) return "21-06";
	return "unknown";
}

export const reportRoutes = new Hono()
	.use("*", authMiddleware)

	.get("/weekly", async (c) => {
		const userId = c.get("userId");
		const thisWeek = getWeekRange(0);
		const lastWeek = getWeekRange(1);

		try {
			const [thisWeekRecords, lastWeekRecords, thisWeekSnapshots] = await Promise.all([
				db.smokingRecord.findMany({
					where: {
						userId,
						smokedAt: { gte: thisWeek.start, lte: thisWeek.end },
					},
					orderBy: { smokedAt: "asc" },
				}),
				db.smokingRecord.findMany({
					where: {
						userId,
						smokedAt: { gte: lastWeek.start, lte: lastWeek.end },
					},
				}),
				db.dailySnapshot.findMany({
					where: {
						userId,
						date: { gte: thisWeek.start, lte: thisWeek.end },
					},
					orderBy: { date: "asc" },
				}),
			]);

			const thisWeekIntervals = thisWeekRecords
				.map((r) => r.intervalFromPrevious)
				.filter((i): i is number => i !== null);

			const lastWeekIntervals = lastWeekRecords
				.map((r) => r.intervalFromPrevious)
				.filter((i): i is number => i !== null);

			const thisWeekAvgInterval =
				thisWeekIntervals.length > 0
					? Math.round(thisWeekIntervals.reduce((a, b) => a + b, 0) / thisWeekIntervals.length)
					: null;

			const lastWeekAvgInterval =
				lastWeekIntervals.length > 0
					? Math.round(lastWeekIntervals.reduce((a, b) => a + b, 0) / lastWeekIntervals.length)
					: null;

			const intervalChange =
				thisWeekAvgInterval !== null && lastWeekAvgInterval !== null
					? thisWeekAvgInterval - lastWeekAvgInterval
					: null;

			const thisWeekTotalDelay = thisWeekSnapshots.reduce((sum, s) => sum + s.totalDelayMinutes, 0);

			const thisWeekTotalSmoked = thisWeekRecords.length;

			const reasonCounts: Record<string, number> = {};
			thisWeekRecords.forEach((r) => {
				const reason = r.reasonCode ?? "OTHER";
				reasonCounts[reason] = (reasonCounts[reason] ?? 0) + 1;
			});

			const topReasons = Object.entries(reasonCounts)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 3)
				.map(([reason, count]) => ({
					reason,
					count,
					percentage: Math.round((count / thisWeekTotalSmoked) * 100),
				}));

			const hourBuckets: Record<string, { count: number; totalInterval: number }> = {};
			thisWeekRecords.forEach((r) => {
				const bucket = getHourBucket(r.smokedAt);
				if (!hourBuckets[bucket]) {
					hourBuckets[bucket] = { count: 0, totalInterval: 0 };
				}
				hourBuckets[bucket].count++;
				if (r.intervalFromPrevious) {
					hourBuckets[bucket].totalInterval += r.intervalFromPrevious;
				}
			});

			const peakHours = Object.entries(hourBuckets)
				.map(([hour, data]) => ({
					hour,
					count: data.count,
					avgInterval: data.count > 0 ? Math.round(data.totalInterval / data.count) : null,
				}))
				.sort((a, b) => b.count - a.count);

			const bestHour =
				peakHours
					.filter((h) => h.avgInterval !== null)
					.sort((a, b) => (b.avgInterval ?? 0) - (a.avgInterval ?? 0))[0] ?? null;

			const worstHour = peakHours[0] ?? null;

			const delaySuccessDays = thisWeekSnapshots.filter((s) => s.hasDelaySuccess).length;

			const dailyStats = thisWeekSnapshots.map((s) => ({
				date: s.date.toISOString().split("T")[0],
				totalSmoked: s.totalSmoked,
				averageInterval: s.averageInterval ? Math.round(s.averageInterval) : null,
				totalDelayMinutes: s.totalDelayMinutes,
			}));

			return c.json({
				success: true,
				data: {
					summary: {
						avgInterval: thisWeekAvgInterval,
						intervalChange,
						totalDelayMinutes: thisWeekTotalDelay,
						totalSmoked: thisWeekTotalSmoked,
						delaySuccessDays,
					},
					patterns: {
						topReasons,
						peakHours,
						bestHour,
						worstHour,
					},
					dailyStats,
				},
			});
		} catch {
			throw Errors.database("주간 리포트 조회에 실패했습니다");
		}
	})

	.get("/insight", async (c) => {
		const userId = c.get("userId");
		const thisWeek = getWeekRange(0);

		try {
			const records = await db.smokingRecord.findMany({
				where: {
					userId,
					smokedAt: { gte: thisWeek.start, lte: thisWeek.end },
				},
				orderBy: { smokedAt: "asc" },
			});

			if (records.length < 5) {
				return c.json({
					success: true,
					data: {
						message: "아직 데이터가 충분하지 않아요. 조금 더 기록해주세요!",
						suggestion: null,
					},
				});
			}

			const hourBuckets: Record<string, number> = {};
			records.forEach((r) => {
				const bucket = getHourBucket(r.smokedAt);
				hourBuckets[bucket] = (hourBuckets[bucket] ?? 0) + 1;
			});

			const peakHour = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];

			const reasonCounts: Record<string, number> = {};
			records.forEach((r) => {
				const reason = r.reasonCode ?? "OTHER";
				reasonCounts[reason] = (reasonCounts[reason] ?? 0) + 1;
			});

			const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];

			const hourLabels: Record<string, string> = {
				"06-09": "오전 6~9시",
				"09-12": "오전 9~12시",
				"12-15": "오후 12~3시",
				"15-18": "오후 3~6시",
				"18-21": "오후 6~9시",
				"21-06": "밤 9시~새벽 6시",
			};

			const reasonLabels: Record<string, string> = {
				STRESS: "스트레스",
				HABIT: "습관",
				BORED: "지루함",
				SOCIAL: "사회적 상황",
				AFTER_MEAL: "식후",
				OTHER: "기타",
			};

			let message = "";
			let suggestion = "";

			if (peakHour) {
				const hourLabel = hourLabels[peakHour[0]] ?? peakHour[0];
				message = `이번 주에는 ${hourLabel}에 담배를 가장 많이 피웠어요.`;
				suggestion = `내일은 이 시간대에 딱 한 번만, 3분 미루기를 목표로 해볼까요?`;
			}

			if (topReason && topReason[0] !== "OTHER") {
				const reasonLabel = reasonLabels[topReason[0]] ?? topReason[0];
				const percentage = Math.round((topReason[1] / records.length) * 100);

				if (percentage > 30) {
					message = `${reasonLabel} 때문에 피운 비율이 ${percentage}%예요.`;
					suggestion = `${reasonLabel}이(가) 심한 날엔 '30초 코칭 모드'를 한 번 사용해보는 걸 추천드려요.`;
				}
			}

			return c.json({
				success: true,
				data: {
					message,
					suggestion,
					peakHour: peakHour ? { hour: peakHour[0], count: peakHour[1] } : null,
					topReason: topReason ? { reason: topReason[0], count: topReason[1] } : null,
				},
			});
		} catch {
			throw Errors.database("인사이트 조회에 실패했습니다");
		}
	});
