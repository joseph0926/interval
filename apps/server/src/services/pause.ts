import { prisma } from "../lib/prisma.js";
import {
	getLocalDayKey,
	getWeekStartDayKey,
	getWeekDayKeys,
	calculateTodaySummary as engineCalculateTodaySummary,
	calculateWeeklyReport as engineCalculateWeeklyReport,
	type PauseEvent as EnginePauseEvent,
	type WeeklyReport,
} from "@pause/engine";
import type {
	CreatePauseStartInput,
	CreatePauseEndInput,
	PauseTodaySummary,
	UrgeType,
} from "../types/index.js";

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

	const engineEvents = events.map(mapPrismaEventToEngine);
	const summary = engineCalculateTodaySummary(engineEvents, dayKey, settings.dayAnchorMinutes);

	return {
		...summary,
		lastEventAt: summary.lastEventAt?.toISOString() ?? null,
	};
}

export async function getWeeklyReport(userId: string, weekStart?: string): Promise<WeeklyReport> {
	const settings = await getUserSettings(userId);
	const now = new Date();
	const currentDayKey = getLocalDayKey(now, settings.dayAnchorMinutes);
	const weekStartKey = weekStart ?? getWeekStartDayKey(currentDayKey);
	const weekDayKeys = getWeekDayKeys(weekStartKey);

	const events = await prisma.pauseEvent.findMany({
		where: {
			userId,
			localDayKey: { in: weekDayKeys },
		},
		orderBy: { timestamp: "asc" },
	});

	const engineEvents = events.map(mapPrismaEventToEngine);
	return engineCalculateWeeklyReport(engineEvents, weekStartKey, settings.dayAnchorMinutes);
}

function mapPrismaEventToEngine(event: {
	id: string;
	userId: string;
	urgeType: string;
	eventType: string;
	pauseDuration: number | null;
	result: string | null;
	triggerSource: string | null;
	snsAppName: string | null;
	timestamp: Date;
	localDayKey: string;
	pauseStartEventId: string | null;
	metadata: unknown;
	createdAt: Date;
}): EnginePauseEvent {
	return {
		id: event.id,
		userId: event.userId,
		urgeType: event.urgeType as "SMOKE" | "SNS",
		eventType: event.eventType as "URGE" | "PAUSE_START" | "PAUSE_END",
		pauseDuration: event.pauseDuration ?? undefined,
		result: event.result as "COMPLETED" | "GAVE_IN" | "CANCELLED" | undefined,
		triggerSource: event.triggerSource as "MANUAL" | "WIDGET" | "SHORTCUT" | undefined,
		snsAppName: event.snsAppName ?? undefined,
		timestamp: event.timestamp,
		localDayKey: event.localDayKey,
		pauseStartEventId: event.pauseStartEventId ?? undefined,
		metadata: event.metadata as Record<string, unknown> | undefined,
		createdAt: event.createdAt,
	};
}
