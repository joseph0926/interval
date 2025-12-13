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
	CtaKey,
} from "./types.js";
import {
	getLocalDayKey,
	getElapsedMinutes,
	addMinutes,
	getWeekStartDayKey,
	getWeekDayKeys,
} from "./date-utils.js";

const DEFAULT_GAP_THRESHOLD_HOURS = 8;
const GAP_MULTIPLIER = 10;

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

	const todayKey = getLocalDayKey(now, dayAnchorMinutes);
	const todayEvents = events.filter((e) => e.localDayKey === todayKey);

	const actionEvents = todayEvents.filter((e) => e.eventType === "ACTION");
	const delayEvents = todayEvents.filter((e) => e.eventType === "DELAY");

	const allActionEvents = events.filter((e) => e.eventType === "ACTION");
	const lastActionEvent = allActionEvents.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	)[0];

	const { todayEarnedMin, todayLostMin } = calculateDistances(
		actionEvents,
		delayEvents,
		setting.targetIntervalMin,
	);
	const todayNetMin = Math.max(0, todayEarnedMin - todayLostMin);

	if (!lastActionEvent) {
		return createNoBaselineState(
			moduleType,
			setting.targetIntervalMin,
			todayEarnedMin,
			todayLostMin,
			todayNetMin,
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
		ctaPrimary: { key: "LOG_ACTION", enabled: false },
	};
}

function createNoBaselineState(
	moduleType: ModuleType,
	targetIntervalMin: number,
	earnedMin: number,
	lostMin: number,
	netMin: number,
): ModuleState {
	return {
		moduleType,
		status: "NO_BASELINE",
		targetIntervalMin,
		todayEarnedMin: earnedMin,
		todayLostMin: lostMin,
		todayNetMin: netMin,
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
): ModuleState {
	return {
		moduleType,
		status: "GAP_DETECTED",
		lastActionTime,
		targetIntervalMin,
		todayEarnedMin: earnedMin,
		todayLostMin: lostMin,
		todayNetMin: netMin,
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
		ctaPrimary: { key: "LOG_ACTION", enabled: true },
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

	return {
		dayKey,
		integrated,
		modules: moduleStates,
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
		const actionEvents = moduleEvents.filter((e) => e.eventType === "ACTION");

		let earnedMin = 0;
		let lostMin = 0;

		for (const delayEvent of delayEvents) {
			if (delayEvent.delayMinutes) {
				earnedMin += delayEvent.delayMinutes;
			}
		}

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
		});

		totalEarned += earnedMin;
		totalLost += lostMin;
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
