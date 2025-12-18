import { prisma } from "../lib/prisma.js";
import { BADGE_DEFINITIONS, LEVEL_THRESHOLDS, calculateLevel } from "../lib/constants.js";
import { getTodayDateString, getWeekRange } from "../lib/date.js";
import type { GamificationStatus, DistanceBank } from "../types/index.js";

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
		thisWeek: weekLogs.reduce((sum: number, log: { minutes: number }) => sum + log.minutes, 0),
		total: allLogs.reduce((sum: number, log: { minutes: number }) => sum + log.minutes, 0),
	};
}

export async function getGamificationStatus(userId: string): Promise<GamificationStatus> {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
	});

	const delayLogs = await prisma.delayLog.findMany({
		where: { userId },
	});

	const totalDelayMinutes = delayLogs.reduce(
		(sum: number, log: { minutes: number }) => sum + log.minutes,
		0,
	);

	const existingBadges = await prisma.userBadge.findMany({
		where: { userId },
	});

	const earnedBadgeTypes = new Set(existingBadges.map((b: { type: string }) => b.type));

	const newBadges: string[] = [];
	for (const badge of BADGE_DEFINITIONS) {
		if (!earnedBadgeTypes.has(badge.type) && badge.condition(totalDelayMinutes)) {
			newBadges.push(badge.type);
		}
	}

	if (newBadges.length > 0) {
		await prisma.userBadge.createMany({
			data: newBadges.map((type) => ({ userId, type })),
		});
	}

	const allBadges = await prisma.userBadge.findMany({
		where: { userId },
	});

	const badgeMap = new Map(
		allBadges.map((b: { type: string; earnedAt: Date }) => [b.type, b.earnedAt]),
	);

	const badges = BADGE_DEFINITIONS.map((def) => ({
		type: def.type,
		name: def.name,
		description: def.description,
		earned: badgeMap.has(def.type),
		earnedAt: (badgeMap.get(def.type) as Date | undefined)?.toISOString() ?? null,
	}));

	const level = calculateLevel(totalDelayMinutes);
	const nextLevelIndex = level;
	const nextLevel = nextLevelIndex < LEVEL_THRESHOLDS.length ? nextLevelIndex + 1 : null;
	const nextLevelThreshold =
		nextLevelIndex < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[nextLevelIndex] : null;
	const minutesToNextLevel =
		nextLevelThreshold !== null ? nextLevelThreshold - totalDelayMinutes : null;

	const distanceBank = await getDistanceBank(userId, user.dayStartTime);

	return {
		level,
		totalDelayMinutes,
		nextLevel,
		minutesToNextLevel,
		badges,
		earnedBadgesCount: allBadges.length,
		distanceBank,
	};
}
