import { prisma } from "../lib/prisma.js";
import {
	calculateTodaySummary,
	calculateWeeklyReport,
	getLocalDayKey,
	getWeekStartDayKey,
	getElapsedMinutes,
	type ModuleType,
	type ModuleSetting,
	type TodaySummary,
	type WeeklyReport,
	type IntervalEvent,
	type ModuleState,
	type ModuleConfig,
	isSessionModule,
} from "@interval/engine";

const MODULE_TYPES: ModuleType[] = ["SMOKE", "SNS", "CAFFEINE", "FOCUS"];

const DEFAULT_MODULE_SETTINGS: Record<ModuleType, Omit<ModuleSetting, "config">> = {
	SMOKE: { moduleType: "SMOKE", enabled: true, targetIntervalMin: 60 },
	SNS: { moduleType: "SNS", enabled: false, targetIntervalMin: 30 },
	CAFFEINE: { moduleType: "CAFFEINE", enabled: false, targetIntervalMin: 180 },
	FOCUS: { moduleType: "FOCUS", enabled: false, targetIntervalMin: 25 },
};

const DEFAULT_MODULE_CONFIG: Partial<Record<ModuleType, ModuleConfig>> = {
	CAFFEINE: { dailyGoalCount: undefined },
	FOCUS: { defaultSessionMin: 10 },
};

function parseModuleConfig(configJson: unknown): ModuleConfig | undefined {
	if (!configJson || typeof configJson !== "object") {
		return undefined;
	}
	const config = configJson as Record<string, unknown>;
	return {
		dailyGoalCount: typeof config.dailyGoalCount === "number" ? config.dailyGoalCount : undefined,
		defaultSessionMin:
			typeof config.defaultSessionMin === "number" ? config.defaultSessionMin : undefined,
	};
}

type PrismaIntervalEvent = {
	id: string;
	userId: string;
	moduleType: string;
	eventType: string;
	timestamp: Date;
	localDayKey: string;
	actionKind: string | null;
	delayMinutes: number | null;
	reasonLabel: string | null;
	triggerContext: string | null;
	payload: unknown;
};

function mapPrismaEventToIntervalEvent(e: PrismaIntervalEvent): IntervalEvent {
	return {
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
	};
}

function getEnabledModuleSetting(
	moduleSettings: ModuleSetting[],
	moduleType: ModuleType,
): ModuleSetting {
	const setting = moduleSettings.find((s) => s.moduleType === moduleType);
	if (!setting || !setting.enabled) {
		throw new Error(`Module ${moduleType} is not enabled`);
	}
	return setting;
}

async function getUserSettings(userId: string) {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		include: { moduleSettings: true },
	});

	const dayAnchorMinutes = user.dayAnchorMinutes ?? 240;

	const moduleSettings: ModuleSetting[] = MODULE_TYPES.map((moduleType) => {
		const existing = user.moduleSettings.find((s) => s.moduleType === moduleType);

		if (existing) {
			return {
				moduleType,
				enabled: existing.enabled,
				targetIntervalMin: existing.targetIntervalMin,
				config: parseModuleConfig(existing.configJson) ?? DEFAULT_MODULE_CONFIG[moduleType],
			};
		}

		const fallback = DEFAULT_MODULE_SETTINGS[moduleType];
		return {
			...fallback,
			config: DEFAULT_MODULE_CONFIG[moduleType],
		};
	});

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

	return events.map(mapPrismaEventToIntervalEvent);
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
		payload?: Record<string, unknown>;
	},
): Promise<CreateEventResult> {
	const { dayAnchorMinutes, moduleSettings } = await getUserSettings(userId);
	const now = input.timestamp ? new Date(input.timestamp) : new Date();
	const localDayKey = getLocalDayKey(now, dayAnchorMinutes);

	getEnabledModuleSetting(moduleSettings, input.moduleType);

	const actionKind = input.actionKind ?? "CONSUME_OR_OPEN";

	if (actionKind === "CONSUME_OR_OPEN") {
		await assertNoDuplicateAction(userId, input.moduleType, now);
	}

	const payload = input.payload ?? {};
	if (actionKind === "SESSION_END" && isSessionModule(input.moduleType)) {
		await enrichSessionEndPayload(userId, input.moduleType, now, payload);
	}

	const created = await prisma.intervalEvent.create({
		data: {
			userId,
			moduleType: input.moduleType,
			eventType: "ACTION",
			timestamp: now,
			localDayKey,
			actionKind,
			reasonLabel: input.reasonLabel,
			payload: payload as Parameters<typeof prisma.intervalEvent.create>[0]["data"]["payload"],
		},
	});

	const event = mapPrismaEventToIntervalEvent(created);
	const moduleState = await getModuleState(userId, input.moduleType, now);

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

	getEnabledModuleSetting(moduleSettings, input.moduleType);

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

	const event = mapPrismaEventToIntervalEvent(created);
	const moduleState = await getModuleState(userId, input.moduleType, now);

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

	getEnabledModuleSetting(moduleSettings, input.moduleType);

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

	const event = mapPrismaEventToIntervalEvent(created);
	const moduleState = await getModuleState(userId, input.moduleType, now);

	return { event, moduleState };
}

async function assertNoDuplicateAction(
	userId: string,
	moduleType: ModuleType,
	now: Date,
): Promise<void> {
	const recentEvent = await prisma.intervalEvent.findFirst({
		where: {
			userId,
			moduleType,
			eventType: "ACTION",
			actionKind: "CONSUME_OR_OPEN",
			timestamp: { gte: new Date(now.getTime() - 2000) },
		},
	});
	if (recentEvent) {
		throw new Error("Duplicate action within 2 seconds");
	}
}

async function enrichSessionEndPayload(
	userId: string,
	moduleType: ModuleType,
	now: Date,
	payload: Record<string, unknown>,
): Promise<void> {
	const events = await getEventsForUser(userId, [moduleType]);
	const sessionStarts = events
		.filter((e) => e.actionKind === "SESSION_START")
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

	const lastStart = sessionStarts[0];
	if (!lastStart) return;

	const sessionEndsAfter = events.filter(
		(e) => e.actionKind === "SESSION_END" && new Date(e.timestamp) > new Date(lastStart.timestamp),
	);

	if (sessionEndsAfter.length === 0) {
		const startTime = new Date(lastStart.timestamp);
		const actualMinutes = getElapsedMinutes(startTime, now);
		payload.actualMinutes ??= actualMinutes;
		payload.endReason ??= "USER_END";
	}
}

async function getModuleState(
	userId: string,
	moduleType: ModuleType,
	now: Date,
): Promise<ModuleState> {
	const summary = await getEngineTodaySummary(userId, now);
	const moduleState = summary.modules.find((m) => m.moduleType === moduleType);
	if (!moduleState) {
		throw new Error(`Module state not found for ${moduleType}`);
	}
	return moduleState;
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
			config?: ModuleConfig;
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
			const existing = await prisma.userModuleSetting.findUnique({
				where: { userId_moduleType: { userId, moduleType: mod.moduleType } },
			});

			const existingConfig = parseModuleConfig(existing?.configJson);
			const mergedConfig = mod.config ? { ...existingConfig, ...mod.config } : existingConfig;

			const defaultSetting = DEFAULT_MODULE_SETTINGS[mod.moduleType];

			await prisma.userModuleSetting.upsert({
				where: {
					userId_moduleType: { userId, moduleType: mod.moduleType },
				},
				update: {
					...(mod.enabled !== undefined && { enabled: mod.enabled }),
					...(mod.targetIntervalMin !== undefined && { targetIntervalMin: mod.targetIntervalMin }),
					...(mod.config && { configJson: mergedConfig }),
				},
				create: {
					userId,
					moduleType: mod.moduleType,
					enabled: mod.enabled ?? defaultSetting.enabled,
					targetIntervalMin: mod.targetIntervalMin ?? defaultSetting.targetIntervalMin,
					configJson: mergedConfig ?? DEFAULT_MODULE_CONFIG[mod.moduleType],
				},
			});
		}
	}

	return getModuleSettings(userId);
}

export async function softResetModule(
	userId: string,
	moduleType: ModuleType,
): Promise<{ message: string; deletedCount: number; resetAt: string }> {
	const { dayAnchorMinutes } = await getUserSettings(userId);
	const now = new Date();
	const todayKey = getLocalDayKey(now, dayAnchorMinutes);

	const deleted = await prisma.intervalEvent.deleteMany({
		where: {
			userId,
			moduleType,
			localDayKey: todayKey,
		},
	});

	return {
		message: `오늘 ${moduleType} 기록이 초기화되었습니다`,
		deletedCount: deleted.count,
		resetAt: now.toISOString(),
	};
}

export async function softResetAllModules(
	userId: string,
): Promise<{ message: string; deletedCount: number; resetAt: string }> {
	const { dayAnchorMinutes } = await getUserSettings(userId);
	const now = new Date();
	const todayKey = getLocalDayKey(now, dayAnchorMinutes);

	const deleted = await prisma.intervalEvent.deleteMany({
		where: {
			userId,
			localDayKey: todayKey,
		},
	});

	return {
		message: "오늘 모든 모듈 기록이 초기화되었습니다",
		deletedCount: deleted.count,
		resetAt: now.toISOString(),
	};
}
