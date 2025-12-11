import { prisma } from "../lib/prisma.js";
import { MS_PER_MINUTE } from "../lib/constants.js";
import { getTodayRange, getTodayDateString } from "../lib/date.js";
import type { TodaySummary } from "../types/index.js";

export async function getTodaySummary(userId: string): Promise<TodaySummary> {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
	});

	const { start, end } = getTodayRange(user.dayStartTime);

	const records = await prisma.smokingRecord.findMany({
		where: {
			userId,
			smokedAt: { gte: start, lt: end },
		},
		orderBy: { smokedAt: "asc" },
	});

	const totalSmoked = records.length;

	let totalIntervals = 0;
	let intervalCount = 0;
	let earlyCount = 0;

	for (const record of records) {
		if (record.intervalFromPrevious !== null) {
			totalIntervals += record.intervalFromPrevious;
			intervalCount++;
		}
		if (record.wasOnTarget === false) {
			earlyCount++;
		}
	}

	const averageInterval = intervalCount > 0 ? Math.round(totalIntervals / intervalCount) : null;

	const todayStr = getTodayDateString(user.dayStartTime);
	const delayLog = await prisma.delayLog.findUnique({
		where: { userId_date: { userId, date: todayStr } },
	});
	const totalDelayMinutes = delayLog?.minutes ?? 0;

	const lastRecord = records[records.length - 1];
	const firstRecord = records[0];

	let nextTargetTime: string | null = null;
	if (lastRecord) {
		const nextTime = new Date(lastRecord.smokedAt);
		nextTime.setMinutes(nextTime.getMinutes() + user.currentTargetInterval);
		nextTargetTime = nextTime.toISOString();
	}

	return {
		totalSmoked,
		averageInterval,
		totalDelayMinutes,
		targetInterval: user.currentTargetInterval,
		motivation: user.currentMotivation,
		lastSmokedAt: lastRecord?.smokedAt.toISOString() ?? null,
		firstSmokedAt: firstRecord?.smokedAt.toISOString() ?? null,
		nextTargetTime,
		earlyCount,
		dayStartTime: user.dayStartTime,
	};
}

export async function recordSmoking(
	userId: string,
	data: {
		smokedAt: string;
		type: string;
		reasonCode?: string;
		reasonText?: string;
		coachingMode?: string;
		emotionNote?: string;
		delayedMinutes?: number;
	},
) {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
	});

	const smokedAt = new Date(data.smokedAt);
	const { start } = getTodayRange(user.dayStartTime);

	const previousRecord = await prisma.smokingRecord.findFirst({
		where: {
			userId,
			smokedAt: { lt: smokedAt, gte: start },
		},
		orderBy: { smokedAt: "desc" },
	});

	let intervalFromPrevious: number | null = null;
	let wasOnTarget: boolean | null = null;

	if (previousRecord) {
		const diffMs = smokedAt.getTime() - previousRecord.smokedAt.getTime();
		intervalFromPrevious = Math.round(diffMs / MS_PER_MINUTE);
		wasOnTarget = intervalFromPrevious >= user.currentTargetInterval;
	}

	const record = await prisma.smokingRecord.create({
		data: {
			userId,
			smokedAt,
			type: data.type,
			reasonCode: data.reasonCode,
			reasonText: data.reasonText,
			coachingMode: data.coachingMode ?? "NONE",
			emotionNote: data.emotionNote,
			intervalFromPrevious,
			wasOnTarget,
			delayedMinutes: data.delayedMinutes ?? 0,
		},
	});

	if (data.delayedMinutes && data.delayedMinutes > 0) {
		const todayStr = getTodayDateString(user.dayStartTime);
		await prisma.delayLog.upsert({
			where: { userId_date: { userId, date: todayStr } },
			update: { minutes: { increment: data.delayedMinutes } },
			create: { userId, date: todayStr, minutes: data.delayedMinutes },
		});
	}

	return {
		record: {
			id: record.id,
			smokedAt: record.smokedAt.toISOString(),
			type: record.type,
			intervalFromPrevious: record.intervalFromPrevious,
			wasOnTarget: record.wasOnTarget,
			delayedMinutes: record.delayedMinutes,
		},
	};
}

export async function addDelay(userId: string, minutes: number) {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
	});

	const todayStr = getTodayDateString(user.dayStartTime);

	const delayLog = await prisma.delayLog.upsert({
		where: { userId_date: { userId, date: todayStr } },
		update: { minutes: { increment: minutes } },
		create: { userId, date: todayStr, minutes },
	});

	return {
		totalDelayMinutes: delayLog.minutes,
		addedMinutes: minutes,
	};
}

export async function softReset(userId: string) {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
	});

	const { start, end } = getTodayRange(user.dayStartTime);

	await prisma.smokingRecord.deleteMany({
		where: {
			userId,
			smokedAt: { gte: start, lt: end },
		},
	});

	const todayStr = getTodayDateString(user.dayStartTime);
	await prisma.delayLog.deleteMany({
		where: { userId, date: todayStr },
	});

	return {
		message: "오늘 기록이 초기화되었습니다",
		resetAt: new Date().toISOString(),
	};
}
