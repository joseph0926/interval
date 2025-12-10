import { Hono } from "hono";
import { db } from "../lib/db";
import { authMiddleware } from "../middleware/auth";
import { Errors } from "../lib/errors";

type BadgeType =
	| "FIRST_DELAY"
	| "DAILY_10_MINUTES"
	| "STREAK_3_DAYS"
	| "STREAK_7_DAYS"
	| "MAX_INTERVAL_90"
	| "TOTAL_200_MINUTES"
	| "TOTAL_500_MINUTES"
	| "LEVEL_2"
	| "LEVEL_3"
	| "LEVEL_4"
	| "LEVEL_5";

const LEVEL_THRESHOLDS = [
	{ level: 1, minMinutes: 0 },
	{ level: 2, minMinutes: 30 },
	{ level: 3, minMinutes: 120 },
	{ level: 4, minMinutes: 300 },
	{ level: 5, minMinutes: 600 },
];

const BADGE_DEFINITIONS: {
	type: BadgeType;
	name: string;
	description: string;
	check: (data: BadgeCheckData) => boolean;
}[] = [
	{
		type: "FIRST_DELAY",
		name: "간격 입문",
		description: "처음으로 담배와 거리를 벌렸어요",
		check: (d) => d.totalDelayMinutes >= 1,
	},
	{
		type: "DAILY_10_MINUTES",
		name: "오늘의 거리 10분",
		description: "오늘 하루에만 총 10분을 미뤘어요",
		check: (d) => d.todayDelayMinutes >= 10,
	},
	{
		type: "STREAK_3_DAYS",
		name: "연속 3일",
		description: "미루기 연습, 3일 연속 이어가는 중이에요",
		check: (d) => d.currentStreak >= 3,
	},
	{
		type: "STREAK_7_DAYS",
		name: "연속 7일",
		description: "미루기 연습, 7일 연속 이어가는 중이에요",
		check: (d) => d.currentStreak >= 7,
	},
	{
		type: "MAX_INTERVAL_90",
		name: "90분 간격",
		description: "한 번에 90분을 벌려본 건 처음이에요",
		check: (d) => d.maxInterval >= 90,
	},
	{
		type: "TOTAL_200_MINUTES",
		name: "200분 거리 통장",
		description: "누적 200분 거리 벌리기 달성!",
		check: (d) => d.totalDelayMinutes >= 200,
	},
	{
		type: "TOTAL_500_MINUTES",
		name: "500분 거리 통장",
		description: "누적 500분 거리 벌리기 달성!",
		check: (d) => d.totalDelayMinutes >= 500,
	},
	{
		type: "LEVEL_2",
		name: "간격 레벨 2",
		description: "누적 30분 이상 미루기를 해냈어요",
		check: (d) => d.level >= 2,
	},
	{
		type: "LEVEL_3",
		name: "간격 레벨 3",
		description: "누적 120분 이상 미루기를 해냈어요",
		check: (d) => d.level >= 3,
	},
	{
		type: "LEVEL_4",
		name: "간격 레벨 4",
		description: "누적 300분 이상 미루기를 해냈어요",
		check: (d) => d.level >= 4,
	},
	{
		type: "LEVEL_5",
		name: "간격 레벨 5",
		description: "누적 600분 이상 미루기를 해냈어요",
		check: (d) => d.level >= 5,
	},
];

interface BadgeCheckData {
	totalDelayMinutes: number;
	todayDelayMinutes: number;
	currentStreak: number;
	maxInterval: number;
	level: number;
}

function calculateLevel(totalDelayMinutes: number): number {
	for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
		if (totalDelayMinutes >= LEVEL_THRESHOLDS[i].minMinutes) {
			return LEVEL_THRESHOLDS[i].level;
		}
	}
	return 1;
}

function getNextLevelInfo(
	totalDelayMinutes: number,
): { nextLevel: number; minutesNeeded: number } | null {
	const currentLevel = calculateLevel(totalDelayMinutes);
	const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);

	if (!nextThreshold) {
		return null;
	}

	return {
		nextLevel: nextThreshold.level,
		minutesNeeded: nextThreshold.minMinutes - totalDelayMinutes,
	};
}

export const gamificationRoutes = new Hono()
	.use("*", authMiddleware)

	.get("/status", async (c) => {
		const userId = c.get("userId");

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
				select: {
					totalDelayMinutes: true,
					intervalLevel: true,
					badges: {
						select: {
							badgeType: true,
							createdAt: true,
						},
					},
				},
			});

			if (!user) {
				throw Errors.notFound("사용자");
			}

			const calculatedLevel = calculateLevel(user.totalDelayMinutes);
			const nextLevelInfo = getNextLevelInfo(user.totalDelayMinutes);

			if (calculatedLevel !== user.intervalLevel) {
				await db.user.update({
					where: { id: userId },
					data: { intervalLevel: calculatedLevel },
				});
			}

			const badgeList = BADGE_DEFINITIONS.map((def) => {
				const earned = user.badges.find((b) => b.badgeType === def.type);
				return {
					type: def.type,
					name: def.name,
					description: def.description,
					earned: !!earned,
					earnedAt: earned?.createdAt.toISOString() ?? null,
				};
			});

			return c.json({
				success: true,
				data: {
					level: calculatedLevel,
					totalDelayMinutes: user.totalDelayMinutes,
					nextLevel: nextLevelInfo?.nextLevel ?? null,
					minutesToNextLevel: nextLevelInfo?.minutesNeeded ?? null,
					badges: badgeList,
					earnedBadgesCount: user.badges.length,
				},
			});
		} catch (e) {
			if (e instanceof Error && e.message.includes("찾을 수 없습니다")) {
				throw e;
			}
			throw Errors.database("게이미피케이션 상태 조회에 실패했습니다");
		}
	})

	.post("/check-badges", async (c) => {
		const userId = c.get("userId");

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
				select: {
					totalDelayMinutes: true,
					intervalLevel: true,
					dayStartTime: true,
					badges: {
						select: { badgeType: true },
					},
				},
			});

			if (!user) {
				throw Errors.notFound("사용자");
			}

			const now = new Date();
			const todayStart = new Date(now);
			todayStart.setHours(0, 0, 0, 0);

			const [todaySnapshot, recentSnapshots, maxIntervalRecord] = await Promise.all([
				db.dailySnapshot.findFirst({
					where: {
						userId,
						date: { gte: todayStart },
					},
				}),
				db.dailySnapshot.findMany({
					where: { userId, hasDelaySuccess: true },
					orderBy: { date: "desc" },
					take: 30,
				}),
				db.smokingRecord.findFirst({
					where: { userId, intervalFromPrevious: { not: null } },
					orderBy: { intervalFromPrevious: "desc" },
				}),
			]);

			let currentStreak = 0;
			const sortedDates = recentSnapshots
				.map((s) => s.date.toISOString().split("T")[0])
				.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

			if (sortedDates.length > 0) {
				const todayStr = now.toISOString().split("T")[0];
				const expectedDate = new Date(todayStr);

				for (const dateStr of sortedDates) {
					const expectedStr = expectedDate.toISOString().split("T")[0];
					if (dateStr === expectedStr) {
						currentStreak++;
						expectedDate.setDate(expectedDate.getDate() - 1);
					} else {
						break;
					}
				}
			}

			const calculatedLevel = calculateLevel(user.totalDelayMinutes);

			const checkData: BadgeCheckData = {
				totalDelayMinutes: user.totalDelayMinutes,
				todayDelayMinutes: todaySnapshot?.totalDelayMinutes ?? 0,
				currentStreak,
				maxInterval: maxIntervalRecord?.intervalFromPrevious ?? 0,
				level: calculatedLevel,
			};

			const existingBadgeTypes = new Set(user.badges.map((b) => b.badgeType));
			const newBadges: { type: BadgeType; name: string; description: string }[] = [];

			for (const def of BADGE_DEFINITIONS) {
				if (!existingBadgeTypes.has(def.type) && def.check(checkData)) {
					await db.userBadge.create({
						data: {
							userId,
							badgeType: def.type,
						},
					});
					newBadges.push({
						type: def.type,
						name: def.name,
						description: def.description,
					});
				}
			}

			if (calculatedLevel !== user.intervalLevel) {
				await db.user.update({
					where: { id: userId },
					data: { intervalLevel: calculatedLevel },
				});
			}

			return c.json({
				success: true,
				data: {
					newBadges,
					levelUp: calculatedLevel > user.intervalLevel ? calculatedLevel : null,
				},
			});
		} catch (e) {
			if (e instanceof Error && e.message.includes("찾을 수 없습니다")) {
				throw e;
			}
			throw Errors.database("배지 확인에 실패했습니다");
		}
	});
