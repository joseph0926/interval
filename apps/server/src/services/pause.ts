import { prisma } from "../lib/prisma.js";
import type {
	CreatePauseStartInput,
	CreatePauseEndInput,
	PauseTodaySummary,
	ModuleSummary,
	UrgeType,
} from "../types/index.js";

function getLocalDayKey(date: Date, dayAnchorMinutes: number): string {
	const totalMinutes = date.getHours() * 60 + date.getMinutes();
	const adjusted = new Date(date);

	if (totalMinutes < dayAnchorMinutes) {
		adjusted.setDate(adjusted.getDate() - 1);
	}

	return adjusted.toISOString().split("T")[0];
}

function createEmptyModuleSummary(): ModuleSummary {
	return {
		totalUrges: 0,
		pauseAttempts: 0,
		pauseCompleted: 0,
		pauseGaveIn: 0,
		pauseCancelled: 0,
		successRate: 0,
	};
}

function calculateSuccessRate(completed: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((completed / total) * 1000) / 10;
}

export async function getUserSettings(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { dayAnchorMinutes: true, enabledModules: true },
	});

	return {
		dayAnchorMinutes: user?.dayAnchorMinutes ?? 240,
		enabledModules: (user?.enabledModules ?? ["SMOKE"]) as UrgeType[],
	};
}

export async function createPauseStart(userId: string, input: CreatePauseStartInput) {
	const settings = await getUserSettings(userId);
	const now = new Date();
	const localDayKey = getLocalDayKey(now, settings.dayAnchorMinutes);

	const event = await prisma.pauseEvent.create({
		data: {
			userId,
			urgeType: input.urgeType,
			eventType: "PAUSE_START",
			pauseDuration: input.pauseDuration,
			triggerSource: input.triggerSource ?? "MANUAL",
			snsAppName: input.snsAppName,
			timestamp: now,
			localDayKey,
		},
	});

	return event;
}

export async function createPauseEnd(userId: string, input: CreatePauseEndInput) {
	const startEvent = await prisma.pauseEvent.findUnique({
		where: { id: input.pauseStartEventId },
	});

	if (!startEvent || startEvent.userId !== userId) {
		throw new Error("Pause start event not found");
	}

	const settings = await getUserSettings(userId);
	const now = new Date();
	const localDayKey = getLocalDayKey(now, settings.dayAnchorMinutes);

	const endEvent = await prisma.pauseEvent.create({
		data: {
			userId,
			urgeType: startEvent.urgeType,
			eventType: "PAUSE_END",
			pauseDuration: startEvent.pauseDuration,
			result: input.result,
			triggerSource: startEvent.triggerSource,
			snsAppName: startEvent.snsAppName,
			timestamp: now,
			localDayKey,
			pauseStartEventId: input.pauseStartEventId,
		},
	});

	const summary = await getTodaySummary(userId);

	return { event: endEvent, summary };
}

export async function getTodaySummary(userId: string): Promise<PauseTodaySummary> {
	const settings = await getUserSettings(userId);
	const now = new Date();
	const dayKey = getLocalDayKey(now, settings.dayAnchorMinutes);

	const events = await prisma.pauseEvent.findMany({
		where: {
			userId,
			localDayKey: dayKey,
		},
		orderBy: { timestamp: "asc" },
	});

	const pauseEndEvents = events.filter((e) => e.eventType === "PAUSE_END");
	const smokePauseEnd = pauseEndEvents.filter((e) => e.urgeType === "SMOKE");
	const snsPauseEnd = pauseEndEvents.filter((e) => e.urgeType === "SNS");

	const calculateModuleSummary = (moduleEvents: typeof pauseEndEvents): ModuleSummary => {
		const total = moduleEvents.length;
		const completed = moduleEvents.filter((e) => e.result === "COMPLETED").length;
		const gaveIn = moduleEvents.filter((e) => e.result === "GAVE_IN").length;
		const cancelled = moduleEvents.filter((e) => e.result === "CANCELLED").length;

		return {
			totalUrges: 0,
			pauseAttempts: total,
			pauseCompleted: completed,
			pauseGaveIn: gaveIn,
			pauseCancelled: cancelled,
			successRate: calculateSuccessRate(completed, total),
		};
	};

	const totalPauseAttempts = pauseEndEvents.length;
	const totalCompleted = pauseEndEvents.filter((e) => e.result === "COMPLETED").length;
	const totalGaveIn = pauseEndEvents.filter((e) => e.result === "GAVE_IN").length;

	const currentStreak = calculateCurrentStreak(pauseEndEvents);

	const lastEvent = events[events.length - 1];

	return {
		dayKey,
		totalUrges: events.filter((e) => e.eventType === "URGE").length,
		pauseAttempts: totalPauseAttempts,
		pauseCompleted: totalCompleted,
		pauseGaveIn: totalGaveIn,
		successRate: calculateSuccessRate(totalCompleted, totalPauseAttempts),
		currentStreak,
		byType: {
			SMOKE:
				smokePauseEnd.length > 0
					? calculateModuleSummary(smokePauseEnd)
					: createEmptyModuleSummary(),
			SNS:
				snsPauseEnd.length > 0 ? calculateModuleSummary(snsPauseEnd) : createEmptyModuleSummary(),
		},
		lastEventAt: lastEvent?.timestamp.toISOString() ?? null,
	};
}

function calculateCurrentStreak(
	pauseEndEvents: Array<{ result: string | null; timestamp: Date }>,
): number {
	const sorted = [...pauseEndEvents].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

	let streak = 0;
	for (const event of sorted) {
		if (event.result === "COMPLETED") {
			streak++;
		} else {
			break;
		}
	}

	return streak;
}
