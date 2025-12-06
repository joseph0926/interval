import { cache } from "react";
import { prisma } from "./db";
import { getSessionUserId } from "./session";
import type { TodaySummary } from "@/types/home.type";

export const getCurrentUser = cache(async () => {
	const userId = await getSessionUserId();

	if (!userId) {
		return null;
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	return user;
});

export const requireUser = cache(async () => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return user;
});

export const getTodaySummary = cache(async (userId: string): Promise<TodaySummary> => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const records = await prisma.smokingRecord.findMany({
		where: {
			userId,
			smokedAt: {
				gte: today,
				lt: tomorrow,
			},
		},
		orderBy: { smokedAt: "desc" },
	});

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { currentTargetInterval: true, currentMotivation: true },
	});

	const totalSmoked = records.length;
	const lastSmokedAt = records[0]?.smokedAt ?? null;

	let averageInterval: number | null = null;
	if (records.length >= 2) {
		const intervals: number[] = [];
		for (let i = 0; i < records.length - 1; i++) {
			const diff = records[i].smokedAt.getTime() - records[i + 1].smokedAt.getTime();
			intervals.push(diff / 1000 / 60);
		}
		averageInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
	}

	const totalDelayMinutes = records.reduce((sum, r) => sum + r.delayedMinutes, 0);

	return {
		totalSmoked,
		averageInterval,
		totalDelayMinutes,
		lastSmokedAt,
		targetInterval: user?.currentTargetInterval ?? 60,
		motivation: user?.currentMotivation ?? null,
	};
});
