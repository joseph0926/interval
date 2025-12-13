import type {
	IntervalEvent,
	ModuleState,
	ModuleSetting,
	TodaySummary,
	IntegratedSummary,
	WeeklyReport,
	WeeklyModuleReport,
	ModuleType,
	FloatingSuggestion,
	FocusSessionInfo,
	SessionStartPayload,
	SessionEndPayload,
} from "./types.js";
import {
	getLocalDayKey,
	getElapsedMinutes,
	addMinutes,
	getWeekStartDayKey,
	getWeekDayKeys,
} from "./date-utils.js";
import {
	isIntervalModule,
	isSessionModule,
	SessionStartPayloadSchema,
	SessionEndPayloadSchema,
} from "./types.js";

const DEFAULT_GAP_THRESHOLD_HOURS = 8;
const GAP_MULTIPLIER = 10;
const FLOATING_SUGGESTION_MIN = 5;
const FLOATING_SUGGESTION_MAX = 20;
const LONG_SESSION_THRESHOLD_HOURS = 6;

interface CalculateModuleStateInput {
	moduleType: ModuleType;
	setting: ModuleSetting | null;
	events: IntervalEvent[];
	now: Date;
	dayAnchorMinutes: number;
}

export function calculateGapThreshold(targetIntervalMin: number): number {
	const baseThreshold = DEFAULT_GAP_THRESHOLD_HOURS * 60;
	const dynamicThreshold = targetIntervalMin * GAP_MULTIPLIER;
	return Math.max(baseThreshold, dynamicThreshold);
}

export function calculateModuleState(input: CalculateModuleStateInput): ModuleState {
	const { moduleType, setting, events, now, dayAnchorMinutes } = input;

	if (!setting || !setting.enabled) {
		return createDisabledState(moduleType);
	}

	if (isSessionModule(moduleType)) {
		return calculateFocusModuleState(input);
	}

	return calculateIntervalModuleState(input);
}

function calculateIntervalModuleState(input: CalculateModuleStateInput): ModuleState {
	const { moduleType, setting, events, now, dayAnchorMinutes } = input;

	if (!setting) {
		return createDisabledState(moduleType);
	}

	const todayKey = getLocalDayKey(now, dayAnchorMinutes);
	const todayEvents = events.filter((e) => e.localDayKey === todayKey);

	const actionEvents = todayEvents.filter(
		(e) => e.eventType === "ACTION" && e.actionKind === "CONSUME_OR_OPEN",
	);
	const delayEvents = todayEvents.filter((e) => e.eventType === "DELAY");

	const allActionEvents = events.filter(
		(e) => e.eventType === "ACTION" && e.actionKind === "CONSUME_OR_OPEN",
	);
	const lastActionEvent = allActionEvents.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	)[0];

	const { todayEarnedMin, todayLostMin } = calculateDistances(
		actionEvents,
		delayEvents,
		setting.targetIntervalMin,
	);
	const todayNetMin = Math.max(0, todayEarnedMin - todayLostMin);
	const todayActionCount = actionEvents.length;

	if (!lastActionEvent) {
		return createNoBaselineState(
			moduleType,
			setting.targetIntervalMin,
			todayEarnedMin,
			todayLostMin,
			todayNetMin,
			todayActionCount,
			setting.config?.dailyGoalCount,
		);
	}

	const lastActionTime = new Date(lastActionEvent.timestamp);
	const elapsedMin = getElapsedMinutes(lastActionTime, now);
	const gapThreshold = calculateGapThreshold(setting.targetIntervalMin);

	if (elapsedMin > gapThreshold) {
		return createGapDetectedState(
			moduleType,
			lastActionEvent.timestamp,
			setting.targetIntervalMin,
			todayEarnedMin,
			todayLostMin,
			todayNetMin,
			todayActionCount,
			setting.config?.dailyGoalCount,
		);
	}

	const targetTime = addMinutes(lastActionTime, setting.targetIntervalMin);
	const remainingMin = Math.max(0, Math.ceil((targetTime.getTime() - now.getTime()) / 60000));

	if (remainingMin > 0) {
		return createCountdownState(
			moduleType,
			lastActionEvent.timestamp,
			setting.targetIntervalMin,
			targetTime,
			remainingMin,
			elapsedMin,
			todayEarnedMin,
			todayLostMin,
			todayNetMin,
			todayActionCount,
			setting.config?.dailyGoalCount,
		);
	}

	return createReadyState(
		moduleType,
		lastActionEvent.timestamp,
		setting.targetIntervalMin,
		targetTime,
		elapsedMin,
		todayEarnedMin,
		todayLostMin,
		todayNetMin,
		todayActionCount,
		setting.config?.dailyGoalCount,
	);
}

function calculateFocusModuleState(input: CalculateModuleStateInput): ModuleState {
	const { moduleType, setting, events, now, dayAnchorMinutes } = input;

	if (!setting) {
		return createDisabledState(moduleType);
	}

	const todayKey = getLocalDayKey(now, dayAnchorMinutes);
	const todayEvents = events.filter((e) => e.localDayKey === todayKey);
	const delayEvents = todayEvents.filter((e) => e.eventType === "DELAY");

	const todayEarnedMin = delayEvents.reduce((sum, e) => sum + (e.delayMinutes ?? 0), 0);

	const todaySessionEnds = todayEvents.filter(
		(e) => e.eventType === "ACTION" && e.actionKind === "SESSION_END",
	);
	const todayFocusTotalMin = todaySessionEnds.reduce((sum, e) => {
		const payload = e.payload as SessionEndPayload | undefined;
		const parsed = SessionEndPayloadSchema.safeParse(payload);
		if (parsed.success) {
			return sum + parsed.data.actualMinutes;
		}
		return sum;
	}, 0);

	const allSessionStarts = events
		.filter((e) => e.eventType === "ACTION" && e.actionKind === "SESSION_START")
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

	const lastSessionStart = allSessionStarts[0];

	if (!lastSessionStart) {
		return createFocusIdleState(
			moduleType,
			setting.config?.defaultSessionMin ?? 10,
			todayEarnedMin,
			todayFocusTotalMin,
		);
	}

	const sessionStartTime = new Date(lastSessionStart.timestamp);
	const payload = lastSessionStart.payload as SessionStartPayload | undefined;
	const parsed = SessionStartPayloadSchema.safeParse(payload);
	const plannedMinutes = parsed.success ? parsed.data.plannedMinutes : 10;

	const sessionEndsAfterStart = events.filter(
		(e) =>
			e.eventType === "ACTION" &&
			e.actionKind === "SESSION_END" &&
			new Date(e.timestamp) > sessionStartTime,
	);

	if (sessionEndsAfterStart.length > 0) {
		return createFocusIdleState(
			moduleType,
			setting.config?.defaultSessionMin ?? 10,
			todayEarnedMin,
			todayFocusTotalMin,
		);
	}

	const delaysAfterStart = events.filter(
		(e) =>
			e.eventType === "DELAY" &&
			e.triggerContext === "FOCUS_EXTEND" &&
			new Date(e.timestamp) > sessionStartTime,
	);
	const extendedMinutes = delaysAfterStart.reduce((sum, e) => sum + (e.delayMinutes ?? 0), 0);

	const totalPlannedMinutes = plannedMinutes + extendedMinutes;
	const elapsedMinutes = getElapsedMinutes(sessionStartTime, now);
	const remainingMinutes = Math.max(0, totalPlannedMinutes - elapsedMinutes);

	const isLongSession = elapsedMinutes > LONG_SESSION_THRESHOLD_HOURS * 60;

	const focusSession: FocusSessionInfo = {
		sessionStartTime: lastSessionStart.timestamp,
		plannedMinutes,
		elapsedMinutes,
		remainingMinutes,
		extendedMinutes,
	};

	return createFocusRunningState(
		moduleType,
		focusSession,
		todayEarnedMin,
		todayFocusTotalMin,
		setting.config?.defaultSessionMin ?? 10,
		isLongSession,
	);
}

function calculateDistances(
	actionEvents: IntervalEvent[],
	delayEvents: IntervalEvent[],
	targetIntervalMin: number,
): { todayEarnedMin: number; todayLostMin: number } {
	let todayEarnedMin = 0;
	let todayLostMin = 0;

	for (const delayEvent of delayEvents) {
		if (delayEvent.delayMinutes) {
			todayEarnedMin += delayEvent.delayMinutes;
		}
	}

	const sortedActions = [...actionEvents].sort(
		(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
	);

	for (let i = 1; i < sortedActions.length; i++) {
		const prev = sortedActions[i - 1];
		const curr = sortedActions[i];
		const interval = getElapsedMinutes(new Date(prev.timestamp), new Date(curr.timestamp));

		if (interval < targetIntervalMin) {
			todayLostMin += targetIntervalMin - interval;
		}
	}

	return { todayEarnedMin, todayLostMin };
}

function createDisabledState(moduleType: ModuleType): ModuleState {
	return {
		moduleType,
		status: "DISABLED",
		todayEarnedMin: 0,
		todayLostMin: 0,
		todayNetMin: 0,
		todayActionCount: 0,
		todayFocusTotalMin: 0,
		ctaPrimary: { key: "LOG_ACTION", enabled: false },
	};
}

function createNoBaselineState(
	moduleType: ModuleType,
	targetIntervalMin: number,
	earnedMin: number,
	lostMin: number,
	netMin: number,
	actionCount: number,
	dailyGoalCount?: number,
): ModuleState {
	return {
		moduleType,
		status: "NO_BASELINE",
		targetIntervalMin,
		todayEarnedMin: earnedMin,
		todayLostMin: lostMin,
		todayNetMin: netMin,
		todayActionCount: actionCount,
		todayFocusTotalMin: 0,
		dailyGoalCount,
		ctaPrimary: { key: "LOG_ACTION", enabled: true },
	};
}

function createGapDetectedState(
	moduleType: ModuleType,
	lastActionTime: string,
	targetIntervalMin: number,
	earnedMin: number,
	lostMin: number,
	netMin: number,
	actionCount: number,
	dailyGoalCount?: number,
): ModuleState {
	return {
		moduleType,
		status: "GAP_DETECTED",
		lastActionTime,
		targetIntervalMin,
		todayEarnedMin: earnedMin,
		todayLostMin: lostMin,
		todayNetMin: netMin,
		todayActionCount: actionCount,
		todayFocusTotalMin: 0,
		dailyGoalCount,
		ctaPrimary: { key: "RECOVER", enabled: true },
	};
}

function createCountdownState(
	moduleType: ModuleType,
	lastActionTime: string,
	targetIntervalMin: number,
	targetTime: Date,
	remainingMin: number,
	actualIntervalMin: number,
	earnedMin: number,
	lostMin: number,
	netMin: number,
	actionCount: number,
	dailyGoalCount?: number,
): ModuleState {
	return {
		moduleType,
		status: "COUNTDOWN",
		lastActionTime,
		targetIntervalMin,
		targetTime: targetTime.toISOString(),
		remainingMin,
		actualIntervalMin,
		todayEarnedMin: earnedMin,
		todayLostMin: lostMin,
		todayNetMin: netMin,
		todayActionCount: actionCount,
		todayFocusTotalMin: 0,
		dailyGoalCount,
		ctaPrimary: { key: "URGE", enabled: true },
	};
}

function createReadyState(
	moduleType: ModuleType,
	lastActionTime: string,
	targetIntervalMin: number,
	targetTime: Date,
	actualIntervalMin: number,
	earnedMin: number,
	lostMin: number,
	netMin: number,
	actionCount: number,
	dailyGoalCount?: number,
): ModuleState {
	return {
		moduleType,
		status: "READY",
		lastActionTime,
		targetIntervalMin,
		targetTime: targetTime.toISOString(),
		remainingMin: 0,
		actualIntervalMin,
		todayEarnedMin: earnedMin,
		todayLostMin: lostMin,
		todayNetMin: netMin,
		todayActionCount: actionCount,
		todayFocusTotalMin: 0,
		dailyGoalCount,
		ctaPrimary: { key: "LOG_ACTION", enabled: true },
	};
}

function createFocusIdleState(
	moduleType: ModuleType,
	defaultSessionMin: number,
	earnedMin: number,
	focusTotalMin: number,
): ModuleState {
	return {
		moduleType,
		status: "FOCUS_IDLE",
		todayEarnedMin: earnedMin,
		todayLostMin: 0,
		todayNetMin: earnedMin,
		todayActionCount: 0,
		todayFocusTotalMin: focusTotalMin,
		defaultSessionMin,
		ctaPrimary: { key: "START_SESSION", enabled: true },
	};
}

function createFocusRunningState(
	moduleType: ModuleType,
	focusSession: FocusSessionInfo,
	earnedMin: number,
	focusTotalMin: number,
	defaultSessionMin: number,
	isLongSession: boolean,
): ModuleState {
	return {
		moduleType,
		status: "FOCUS_RUNNING",
		todayEarnedMin: earnedMin,
		todayLostMin: 0,
		todayNetMin: earnedMin,
		todayActionCount: 0,
		todayFocusTotalMin: focusTotalMin,
		defaultSessionMin,
		focusSession,
		ctaPrimary: { key: isLongSession ? "END_SESSION" : "URGE_INTERRUPT", enabled: true },
	};
}

interface CalculateTodaySummaryInput {
	settings: ModuleSetting[];
	eventsByModule: Map<ModuleType, IntervalEvent[]>;
	now: Date;
	dayAnchorMinutes: number;
	level?: number;
	totalEarnedMin?: number;
}

export function calculateTodaySummary(input: CalculateTodaySummaryInput): TodaySummary {
	const { settings, eventsByModule, now, dayAnchorMinutes, level, totalEarnedMin } = input;
	const dayKey = getLocalDayKey(now, dayAnchorMinutes);

	const moduleStates: ModuleState[] = [];

	for (const setting of settings) {
		const events = eventsByModule.get(setting.moduleType) || [];
		const state = calculateModuleState({
			moduleType: setting.moduleType,
			setting,
			events,
			now,
			dayAnchorMinutes,
		});
		moduleStates.push(state);
	}

	const integrated: IntegratedSummary = {
		earnedMin: moduleStates.reduce((sum, m) => sum + m.todayEarnedMin, 0),
		lostMin: moduleStates.reduce((sum, m) => sum + m.todayLostMin, 0),
		netMin: moduleStates.reduce((sum, m) => sum + m.todayNetMin, 0),
		level,
		nextLevelRemainingMin:
			level !== undefined && totalEarnedMin !== undefined
				? calculateNextLevelRemaining(level, totalEarnedMin)
				: undefined,
	};

	const floatingSuggestion = calculateFloatingSuggestion(moduleStates);

	return {
		dayKey,
		integrated,
		modules: moduleStates,
		floatingSuggestion,
	};
}

function calculateFloatingSuggestion(moduleStates: ModuleState[]): FloatingSuggestion | undefined {
	const intervalModules = moduleStates.filter(
		(m) =>
			isIntervalModule(m.moduleType) && m.status === "COUNTDOWN" && m.remainingMin !== undefined,
	);

	const candidates = intervalModules.filter(
		(m) =>
			m.remainingMin !== undefined &&
			m.remainingMin >= FLOATING_SUGGESTION_MIN &&
			m.remainingMin <= FLOATING_SUGGESTION_MAX,
	);

	if (candidates.length === 0) {
		return undefined;
	}

	const closest = candidates.reduce((prev, curr) =>
		(curr.remainingMin ?? Infinity) < (prev.remainingMin ?? Infinity) ? curr : prev,
	);

	return {
		moduleType: closest.moduleType,
		remainingMin: closest.remainingMin!,
		options: [1, 3],
	};
}

function calculateNextLevelRemaining(currentLevel: number, totalEarnedMin: number): number {
	const thresholds = [0, 30, 120, 360, 720, 1440, 2880, 5760, 11520, 23040];
	const nextLevel = currentLevel + 1;
	if (nextLevel >= thresholds.length) return 0;
	return Math.max(0, thresholds[nextLevel] - totalEarnedMin);
}

interface CalculateWeeklyReportInput {
	settings: ModuleSetting[];
	allEvents: IntervalEvent[];
	weekStartDayKey: string;
}

export function calculateWeeklyReport(input: CalculateWeeklyReportInput): WeeklyReport {
	const { settings, allEvents, weekStartDayKey } = input;
	const weekDayKeys = getWeekDayKeys(weekStartDayKey);

	const weekEvents = allEvents.filter((e) => weekDayKeys.includes(e.localDayKey));

	const moduleReports: WeeklyModuleReport[] = [];
	let totalEarned = 0;
	let totalLost = 0;

	for (const setting of settings) {
		if (!setting.enabled) continue;

		const moduleEvents = weekEvents.filter((e) => e.moduleType === setting.moduleType);
		const delayEvents = moduleEvents.filter((e) => e.eventType === "DELAY");

		let earnedMin = 0;
		for (const delayEvent of delayEvents) {
			if (delayEvent.delayMinutes) {
				earnedMin += delayEvent.delayMinutes;
			}
		}

		if (isIntervalModule(setting.moduleType)) {
			const actionEvents = moduleEvents.filter(
				(e) => e.eventType === "ACTION" && e.actionKind === "CONSUME_OR_OPEN",
			);
			const actionCount = actionEvents.length;

			let lostMin = 0;
			const sortedActions = [...actionEvents].sort(
				(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			);

			let totalInterval = 0;
			let intervalCount = 0;

			for (let i = 1; i < sortedActions.length; i++) {
				const prev = sortedActions[i - 1];
				const curr = sortedActions[i];
				const interval = getElapsedMinutes(new Date(prev.timestamp), new Date(curr.timestamp));
				totalInterval += interval;
				intervalCount++;

				if (interval < setting.targetIntervalMin) {
					lostMin += setting.targetIntervalMin - interval;
				}
			}

			const avgIntervalMin =
				intervalCount > 0 ? Math.round(totalInterval / intervalCount) : undefined;
			const netMin = Math.max(0, earnedMin - lostMin);

			moduleReports.push({
				moduleType: setting.moduleType,
				earnedMin,
				lostMin,
				netMin,
				avgIntervalMin,
				actionCount,
				focusTotalMin: 0,
			});

			totalEarned += earnedMin;
			totalLost += lostMin;
		} else if (isSessionModule(setting.moduleType)) {
			const sessionEnds = moduleEvents.filter(
				(e) => e.eventType === "ACTION" && e.actionKind === "SESSION_END",
			);

			let focusTotalMin = 0;
			const sessionDurations: number[] = [];

			for (const endEvent of sessionEnds) {
				const payload = endEvent.payload as SessionEndPayload | undefined;
				const parsed = SessionEndPayloadSchema.safeParse(payload);
				if (parsed.success) {
					focusTotalMin += parsed.data.actualMinutes;
					sessionDurations.push(parsed.data.actualMinutes);
				}
			}

			const avgSessionMin =
				sessionDurations.length > 0
					? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
					: undefined;

			moduleReports.push({
				moduleType: setting.moduleType,
				earnedMin,
				lostMin: 0,
				netMin: earnedMin,
				focusTotalMin,
				avgSessionMin,
				actionCount: sessionEnds.length,
			});

			totalEarned += earnedMin;
		}
	}

	return {
		weekStartDayKey,
		integrated: {
			earnedMin: totalEarned,
			lostMin: totalLost,
			netMin: Math.max(0, totalEarned - totalLost),
		},
		modules: moduleReports,
	};
}

export function calculateEarlyLostMinutes(targetTime: Date, now: Date): number {
	if (now >= targetTime) return 0;
	return Math.ceil((targetTime.getTime() - now.getTime()) / 60000);
}
