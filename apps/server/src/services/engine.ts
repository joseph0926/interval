import { prisma } from "../lib/prisma.js";
import {
	calculateTodaySummary,
	calculateWeeklyReport,
	getLocalDayKey,
	getWeekStartDayKey,
	type ModuleType,
	type ModuleSetting,
	type TodaySummary,
	type WeeklyReport,
	type IntervalEvent,
	type ModuleState,
} from "@interval/engine";

const DEFAULT_MODULE_SETTINGS: Record<string, ModuleSetting> = {
	SMOKE: { moduleType: "SMOKE", enabled: true, targetIntervalMin: 60 },
	SNS: { moduleType: "SNS", enabled: false, targetIntervalMin: 30 },
	CAFFEINE: { moduleType: "CAFFEINE", enabled: false, targetIntervalMin: 180 },
	FOCUS: { moduleType: "FOCUS", enabled: false, targetIntervalMin: 25 },
};

async function getUserSettings(userId: string) {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		include: { moduleSettings: true },
	});

	const dayAnchorMinutes = user.dayAnchorMinutes ?? 240;

	const moduleSettings: ModuleSetting[] = [];
	const moduleTypes: ModuleType[] = ["SMOKE", "SNS", "CAFFEINE", "FOCUS"];

	for (const moduleType of moduleTypes) {
		const existing = user.moduleSettings.find((s) => s.moduleType === moduleType);
		if (existing) {
			moduleSettings.push({
				moduleType: moduleType as ModuleType,
				enabled: existing.enabled,
				targetIntervalMin: existing.targetIntervalMin,
			});
		} else {
			const fallback = DEFAULT_MODULE_SETTINGS[moduleType];
			if (moduleType === "SMOKE") {
				moduleSettings.push({
					moduleType: "SMOKE",
					enabled: user.enabledModules?.includes("SMOKING") ?? true,
					targetIntervalMin: user.currentTargetInterval ?? 60,
				});
			} else {
				moduleSettings.push(fallback);
			}
		}
	}

	return { dayAnchorMinutes, moduleSettings, user };
}

async function getEventsForUser(
	userId: string,
	moduleTypes?: ModuleType[],
	startDate?: Date,
): Promise<IntervalEvent[]> {
	const where: { userId: string; moduleType?: { in: string[] }; timestamp?: { gte: Date } } = {
		userId,
	};

	if (moduleTypes && moduleTypes.length > 0) {
		where.moduleType = { in: moduleTypes };
	}
	if (startDate) {
		where.timestamp = { gte: startDate };
	}

	const events = await prisma.intervalEvent.findMany({
		where,
		orderBy: { timestamp: "asc" },
	});

	return events.map((e) => ({
		id: e.id,
		userId: e.userId,
		moduleType: e.moduleType as ModuleType,
		eventType: e.eventType as IntervalEvent["eventType"],
		timestamp: e.timestamp.toISOString(),
		localDayKey: e.localDayKey,
		actionKind: e.actionKind as IntervalEvent["actionKind"],
		delayMinutes: e.delayMinutes ?? undefined,
		reasonLabel: e.reasonLabel as IntervalEvent["reasonLabel"],
		triggerContext: e.triggerContext as IntervalEvent["triggerContext"],
		payload: (e.payload as Record<string, unknown>) ?? undefined,
	}));
}

export async function getEngineTodaySummary(
	userId: string,
	now: Date = new Date(),
): Promise<TodaySummary> {
	const { dayAnchorMinutes, moduleSettings } = await getUserSettings(userId);

	const enabledModules = moduleSettings.filter((s) => s.enabled).map((s) => s.moduleType);

	const events = await getEventsForUser(userId, enabledModules);

	const eventsByModule = new Map<ModuleType, IntervalEvent[]>();
	for (const event of events) {
		const list = eventsByModule.get(event.moduleType) || [];
		list.push(event);
		eventsByModule.set(event.moduleType, list);
	}

	return calculateTodaySummary({
		settings: moduleSettings.filter((s) => s.enabled),
		eventsByModule,
		now,
		dayAnchorMinutes,
	});
}

export async function getEngineWeeklyReport(
	userId: string,
	weekStartDayKey?: string,
): Promise<WeeklyReport> {
	const { dayAnchorMinutes, moduleSettings } = await getUserSettings(userId);

	const actualWeekStart =
		weekStartDayKey || getWeekStartDayKey(getLocalDayKey(new Date(), dayAnchorMinutes));

	const events = await getEventsForUser(userId);

	return calculateWeeklyReport({
		settings: moduleSettings,
		allEvents: events,
		weekStartDayKey: actualWeekStart,
	});
}

interface CreateEventResult {
	event: IntervalEvent;
	moduleState: ModuleState;
}

export async function createActionEvent(
	userId: string,
	input: {
		moduleType: ModuleType;
		timestamp?: string;
		reasonLabel?: IntervalEvent["reasonLabel"];
		actionKind?: IntervalEvent["actionKind"];
	},
): Promise<CreateEventResult> {
	const { dayAnchorMinutes, moduleSettings } = await getUserSettings(userId);
	const now = input.timestamp ? new Date(input.timestamp) : new Date();
	const localDayKey = getLocalDayKey(now, dayAnchorMinutes);

	const moduleSetting = moduleSettings.find((s) => s.moduleType === input.moduleType);
	if (!moduleSetting || !moduleSetting.enabled) {
		throw new Error(`Module ${input.moduleType} is not enabled`);
	}

	const recentEvent = await prisma.intervalEvent.findFirst({
		where: {
			userId,
			moduleType: input.moduleType,
			eventType: "ACTION",
			timestamp: { gte: new Date(now.getTime() - 2000) },
		},
	});
	if (recentEvent) {
		throw new Error("Duplicate action within 2 seconds");
	}

	const created = await prisma.intervalEvent.create({
		data: {
			userId,
			moduleType: input.moduleType,
			eventType: "ACTION",
			timestamp: now,
			localDayKey,
			actionKind: input.actionKind ?? "CONSUME_OR_OPEN",
			reasonLabel: input.reasonLabel,
		},
	});

	const event: IntervalEvent = {
		id: created.id,
		userId: created.userId,
		moduleType: created.moduleType as ModuleType,
		eventType: "ACTION",
		timestamp: created.timestamp.toISOString(),
		localDayKey: created.localDayKey,
		actionKind: (created.actionKind ?? "CONSUME_OR_OPEN") as IntervalEvent["actionKind"],
		reasonLabel: created.reasonLabel as IntervalEvent["reasonLabel"],
	};

	const summary = await getEngineTodaySummary(userId, now);
	const moduleState = summary.modules.find((m) => m.moduleType === input.moduleType)!;

	return { event, moduleState };
}

export async function createDelayEvent(
	userId: string,
	input: {
		moduleType: ModuleType;
		delayMinutes: number;
		triggerContext: IntervalEvent["triggerContext"];
		timestamp?: string;
	},
): Promise<CreateEventResult> {
	const { dayAnchorMinutes, moduleSettings } = await getUserSettings(userId);
	const now = input.timestamp ? new Date(input.timestamp) : new Date();
	const localDayKey = getLocalDayKey(now, dayAnchorMinutes);

	const moduleSetting = moduleSettings.find((s) => s.moduleType === input.moduleType);
	if (!moduleSetting || !moduleSetting.enabled) {
		throw new Error(`Module ${input.moduleType} is not enabled`);
	}

	const created = await prisma.intervalEvent.create({
		data: {
			userId,
			moduleType: input.moduleType,
			eventType: "DELAY",
			timestamp: now,
			localDayKey,
			delayMinutes: input.delayMinutes,
			triggerContext: input.triggerContext,
		},
	});

	const event: IntervalEvent = {
		id: created.id,
		userId: created.userId,
		moduleType: created.moduleType as ModuleType,
		eventType: "DELAY",
		timestamp: created.timestamp.toISOString(),
		localDayKey: created.localDayKey,
		delayMinutes: created.delayMinutes ?? undefined,
		triggerContext: created.triggerContext as IntervalEvent["triggerContext"],
	};

	const summary = await getEngineTodaySummary(userId, now);
	const moduleState = summary.modules.find((m) => m.moduleType === input.moduleType)!;

	return { event, moduleState };
}

export async function createAdjustmentEvent(
	userId: string,
	input: {
		moduleType: ModuleType;
		adjustmentKind: "RESET_BASELINE" | "APPROXIMATE_LOG";
		payload?: Record<string, unknown>;
	},
): Promise<CreateEventResult> {
	const { dayAnchorMinutes, moduleSettings } = await getUserSettings(userId);
	const now = new Date();
	const localDayKey = getLocalDayKey(now, dayAnchorMinutes);

	const moduleSetting = moduleSettings.find((s) => s.moduleType === input.moduleType);
	if (!moduleSetting || !moduleSetting.enabled) {
		throw new Error(`Module ${input.moduleType} is not enabled`);
	}

	const created = await prisma.intervalEvent.create({
		data: {
			userId,
			moduleType: input.moduleType,
			eventType: "ADJUSTMENT",
			timestamp: now,
			localDayKey,
			actionKind: input.adjustmentKind,
			payload: input.payload as Parameters<
				typeof prisma.intervalEvent.create
			>[0]["data"]["payload"],
		},
	});

	if (input.adjustmentKind === "RESET_BASELINE") {
		await prisma.intervalEvent.create({
			data: {
				userId,
				moduleType: input.moduleType,
				eventType: "ACTION",
				timestamp: now,
				localDayKey,
				actionKind: "CONSUME_OR_OPEN",
			},
		});
	}

	const event: IntervalEvent = {
		id: created.id,
		userId: created.userId,
		moduleType: created.moduleType as ModuleType,
		eventType: "ADJUSTMENT",
		timestamp: created.timestamp.toISOString(),
		localDayKey: created.localDayKey,
		actionKind: created.actionKind as IntervalEvent["actionKind"],
		payload: (created.payload as Record<string, unknown>) ?? undefined,
	};

	const summary = await getEngineTodaySummary(userId, now);
	const moduleState = summary.modules.find((m) => m.moduleType === input.moduleType)!;

	return { event, moduleState };
}

export async function getModuleSettings(userId: string) {
	const { dayAnchorMinutes, moduleSettings } = await getUserSettings(userId);
	return { dayAnchorMinutes, modules: moduleSettings };
}

export async function updateModuleSettings(
	userId: string,
	input: {
		dayAnchorMinutes?: number;
		modules?: Array<{
			moduleType: ModuleType;
			enabled?: boolean;
			targetIntervalMin?: number;
		}>;
	},
) {
	if (input.dayAnchorMinutes !== undefined) {
		await prisma.user.update({
			where: { id: userId },
			data: { dayAnchorMinutes: input.dayAnchorMinutes },
		});
	}

	if (input.modules) {
		for (const mod of input.modules) {
			await prisma.userModuleSetting.upsert({
				where: {
					userId_moduleType: { userId, moduleType: mod.moduleType },
				},
				update: {
					...(mod.enabled !== undefined && { enabled: mod.enabled }),
					...(mod.targetIntervalMin !== undefined && { targetIntervalMin: mod.targetIntervalMin }),
				},
				create: {
					userId,
					moduleType: mod.moduleType,
					enabled: mod.enabled ?? DEFAULT_MODULE_SETTINGS[mod.moduleType]?.enabled ?? false,
					targetIntervalMin:
						mod.targetIntervalMin ??
						DEFAULT_MODULE_SETTINGS[mod.moduleType]?.targetIntervalMin ??
						60,
				},
			});
		}
	}

	return getModuleSettings(userId);
}
