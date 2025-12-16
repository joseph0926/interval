import type {
	IntervalEvent,
	ModuleState,
	ModuleSetting,
	TodaySummary,
	IntegratedSummary,
	WeeklyReport,
	WeeklyModuleReport,
	ModuleType,
	ModuleStatus,
	FloatingSuggestion,
	FocusSessionInfo,
	CtaPrimary,
	CtaKey,
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

interface TodayStats {
	earnedMin: number;
	lostMin: number;
	netMin: number;
	actionCount: number;
}

interface TimingInfo {
	lastActionTime?: string;
	targetTime?: string;
	remainingMin?: number;
	actualIntervalMin?: number;
}

export function calculateGapThreshold(targetIntervalMin: number): number {
	const baseThreshold = DEFAULT_GAP_THRESHOLD_HOURS * 60;
	const dynamicThreshold = targetIntervalMin * GAP_MULTIPLIER;
	return Math.max(baseThreshold, dynamicThreshold);
}

export function calculateModuleState(input: CalculateModuleStateInput): ModuleState {
	const { moduleType, setting } = input;

	if (!setting || !setting.enabled) {
		return buildModuleState({ moduleType, status: "DISABLED" });
	}

	if (isSessionModule(moduleType)) {
		return calculateFocusModuleState(input);
	}

	return calculateIntervalModuleState(input);
}

function calculateIntervalModuleState(input: CalculateModuleStateInput): ModuleState {
	const { moduleType, setting, events, now, dayAnchorMinutes } = input;

	if (!setting) {
		return buildModuleState({ moduleType, status: "DISABLED" });
	}

	const todayStats = calculateIntervalTodayStats(
		events,
		now,
		dayAnchorMinutes,
		setting.targetIntervalMin,
	);
	const timing = calculateIntervalTiming(events, now, setting.targetIntervalMin);
	const status = deriveIntervalStatus(timing, setting.targetIntervalMin);
	const cta = deriveCta(status);

	return buildModuleState({
		moduleType,
		status,
		timing,
		todayStats,
		cta,
		targetIntervalMin: setting.targetIntervalMin,
		dailyGoalCount: setting.config?.dailyGoalCount,
	});
}

function calculateIntervalTodayStats(
	events: IntervalEvent[],
	now: Date,
	dayAnchorMinutes: number,
	targetIntervalMin: number,
): TodayStats {
	const todayKey = getLocalDayKey(now, dayAnchorMinutes);
	const todayEvents = events.filter((e) => e.localDayKey === todayKey);

	const actionEvents = todayEvents.filter(
		(e) => e.eventType === "ACTION" && e.actionKind === "CONSUME_OR_OPEN",
	);
	const delayEvents = todayEvents.filter((e) => e.eventType === "DELAY");

	const { todayEarnedMin, todayLostMin } = calculateDistances(
		actionEvents,
		delayEvents,
		targetIntervalMin,
	);

	return {
		earnedMin: todayEarnedMin,
		lostMin: todayLostMin,
		netMin: Math.max(0, todayEarnedMin - todayLostMin),
		actionCount: actionEvents.length,
	};
}

function calculateIntervalTiming(
	events: IntervalEvent[],
	now: Date,
	targetIntervalMin: number,
): TimingInfo {
	const allActionEvents = events.filter(
		(e) => e.eventType === "ACTION" && e.actionKind === "CONSUME_OR_OPEN",
	);
	const lastActionEvent = allActionEvents.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	)[0];

	if (!lastActionEvent) {
		return {};
	}

	const lastActionTime = new Date(lastActionEvent.timestamp);
	const elapsedMin = getElapsedMinutes(lastActionTime, now);
	const targetTime = addMinutes(lastActionTime, targetIntervalMin);
	const remainingMin = Math.max(0, Math.ceil((targetTime.getTime() - now.getTime()) / 60000));

	return {
		lastActionTime: lastActionEvent.timestamp,
		targetTime: targetTime.toISOString(),
		remainingMin,
		actualIntervalMin: elapsedMin,
	};
}

function deriveIntervalStatus(timing: TimingInfo, targetIntervalMin: number): ModuleStatus {
	if (!timing.lastActionTime) {
		return "NO_BASELINE";
	}

	const gapThreshold = calculateGapThreshold(targetIntervalMin);
	if ((timing.actualIntervalMin ?? 0) > gapThreshold) {
		return "GAP_DETECTED";
	}

	if ((timing.remainingMin ?? 0) > 0) {
		return "COUNTDOWN";
	}

	return "READY";
}

function deriveCta(status: ModuleStatus): CtaPrimary {
	const ctaMap: Record<ModuleStatus, { key: CtaKey; enabled: boolean }> = {
		DISABLED: { key: "LOG_ACTION", enabled: false },
		SETUP_REQUIRED: { key: "LOG_ACTION", enabled: false },
		NO_BASELINE: { key: "LOG_ACTION", enabled: true },
		GAP_DETECTED: { key: "RECOVER", enabled: true },
		COUNTDOWN: { key: "URGE", enabled: true },
		READY: { key: "LOG_ACTION", enabled: true },
		FOCUS_IDLE: { key: "START_SESSION", enabled: true },
		FOCUS_RUNNING: { key: "URGE_INTERRUPT", enabled: true },
		FOCUS_COACHING: { key: "URGE_INTERRUPT", enabled: true },
	};
	return ctaMap[status];
}

interface BuildModuleStateInput {
	moduleType: ModuleType;
	status: ModuleStatus;
	timing?: TimingInfo;
	todayStats?: TodayStats;
	cta?: CtaPrimary;
	targetIntervalMin?: number;
	dailyGoalCount?: number;
	defaultSessionMin?: number;
	focusSession?: FocusSessionInfo;
	todayFocusTotalMin?: number;
}

function buildModuleState(input: BuildModuleStateInput): ModuleState {
	const {
		moduleType,
		status,
		timing = {},
		todayStats = { earnedMin: 0, lostMin: 0, netMin: 0, actionCount: 0 },
		cta = { key: "LOG_ACTION" as CtaKey, enabled: false },
		targetIntervalMin,
		dailyGoalCount,
		defaultSessionMin,
		focusSession,
		todayFocusTotalMin = 0,
	} = input;

	return {
		moduleType,
		status,
		lastActionTime: timing.lastActionTime,
		targetIntervalMin,
		targetTime: timing.targetTime,
		remainingMin: timing.remainingMin,
		actualIntervalMin: timing.actualIntervalMin,
		todayEarnedMin: todayStats.earnedMin,
		todayLostMin: todayStats.lostMin,
		todayNetMin: todayStats.netMin,
		todayActionCount: todayStats.actionCount,
		todayFocusTotalMin,
		dailyGoalCount,
		defaultSessionMin,
		focusSession,
		ctaPrimary: cta,
	};
}

function calculateFocusModuleState(input: CalculateModuleStateInput): ModuleState {
	const { moduleType, setting, events, now, dayAnchorMinutes } = input;

	if (!setting) {
		return buildModuleState({ moduleType, status: "DISABLED" });
	}

	const defaultSessionMin = setting.config?.defaultSessionMin ?? 10;
	const focusStats = calculateFocusTodayStats(events, now, dayAnchorMinutes);
	const sessionInfo = calculateFocusSession(events, now);

	const status: ModuleStatus = sessionInfo ? "FOCUS_RUNNING" : "FOCUS_IDLE";
	const isLongSession = sessionInfo
		? sessionInfo.elapsedMinutes > LONG_SESSION_THRESHOLD_HOURS * 60
		: false;
	const cta: CtaPrimary = sessionInfo
		? { key: isLongSession ? "END_SESSION" : "URGE_INTERRUPT", enabled: true }
		: { key: "START_SESSION", enabled: true };

	return buildModuleState({
		moduleType,
		status,
		todayStats: {
			earnedMin: focusStats.earnedMin,
			lostMin: 0,
			netMin: focusStats.earnedMin,
			actionCount: 0,
		},
		cta,
		defaultSessionMin,
		focusSession: sessionInfo,
		todayFocusTotalMin: focusStats.focusTotalMin,
	});
}

interface FocusTodayStats {
	earnedMin: number;
	focusTotalMin: number;
}

function calculateFocusTodayStats(
	events: IntervalEvent[],
	now: Date,
	dayAnchorMinutes: number,
): FocusTodayStats {
	const todayKey = getLocalDayKey(now, dayAnchorMinutes);
	const todayEvents = events.filter((e) => e.localDayKey === todayKey);

	const delayEvents = todayEvents.filter((e) => e.eventType === "DELAY");
	const earnedMin = delayEvents.reduce((sum, e) => sum + (e.delayMinutes ?? 0), 0);

	const sessionEnds = todayEvents.filter(
		(e) => e.eventType === "ACTION" && e.actionKind === "SESSION_END",
	);
	const focusTotalMin = sessionEnds.reduce((sum, e) => {
		const payload = e.payload as SessionEndPayload | undefined;
		const parsed = SessionEndPayloadSchema.safeParse(payload);
		return parsed.success ? sum + parsed.data.actualMinutes : sum;
	}, 0);

	return { earnedMin, focusTotalMin };
}

function calculateFocusSession(events: IntervalEvent[], now: Date): FocusSessionInfo | undefined {
	const sessionStarts = events
		.filter((e) => e.eventType === "ACTION" && e.actionKind === "SESSION_START")
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

	const lastSessionStart = sessionStarts[0];
	if (!lastSessionStart) {
		return undefined;
	}

	const sessionStartTime = new Date(lastSessionStart.timestamp);

	const sessionEndsAfterStart = events.filter(
		(e) =>
			e.eventType === "ACTION" &&
			e.actionKind === "SESSION_END" &&
			new Date(e.timestamp) > sessionStartTime,
	);

	if (sessionEndsAfterStart.length > 0) {
		return undefined;
	}

	const payload = lastSessionStart.payload as SessionStartPayload | undefined;
	const parsed = SessionStartPayloadSchema.safeParse(payload);
	const plannedMinutes = parsed.success ? parsed.data.plannedMinutes : 10;

	const delaysAfterStart = events.filter(
		(e) =>
			e.eventType === "DELAY" &&
			e.triggerContext === "FOCUS_EXTEND" &&
			new Date(e.timestamp) > sessionStartTime,
	);
	const extendedMinutes = delaysAfterStart.reduce((sum, e) => sum + (e.delayMinutes ?? 0), 0);

	const elapsedMinutes = getElapsedMinutes(sessionStartTime, now);
	const remainingMinutes = Math.max(0, plannedMinutes + extendedMinutes - elapsedMinutes);

	return {
		sessionStartTime: lastSessionStart.timestamp,
		plannedMinutes,
		elapsedMinutes,
		remainingMinutes,
		extendedMinutes,
	};
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
