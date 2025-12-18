import type {
	PauseEvent,
	TodaySummary,
	ModuleSummary,
	WeeklyReport,
	DailySummary,
	UrgeType,
} from "./types.js";
import { getWeekDayKeys, getWeekEndDayKey } from "./date-utils.js";

export function createEmptyModuleSummary(): ModuleSummary {
	return {
		totalUrges: 0,
		pauseAttempts: 0,
		pauseCompleted: 0,
		pauseGaveIn: 0,
		pauseCancelled: 0,
		successRate: 0,
	};
}

export function createEmptyTodaySummary(dayKey: string): TodaySummary {
	return {
		dayKey,
		totalUrges: 0,
		pauseAttempts: 0,
		pauseCompleted: 0,
		pauseGaveIn: 0,
		successRate: 0,
		currentStreak: 0,
		byType: {
			SMOKE: createEmptyModuleSummary(),
			SNS: createEmptyModuleSummary(),
		},
		lastEventAt: undefined,
	};
}

export function createEmptyDailySummary(dayKey: string): DailySummary {
	return {
		dayKey,
		pauseAttempts: 0,
		pauseCompleted: 0,
		pauseGaveIn: 0,
		successRate: 0,
	};
}

export function calculateSuccessRate(completed: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((completed / total) * 1000) / 10;
}

export function calculateCurrentStreak(events: PauseEvent[]): number {
	const pauseEndEvents = events.filter((e) => e.eventType === "PAUSE_END");

	const sorted = [...pauseEndEvents].sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);

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

export function calculateModuleSummary(
	pauseEndEvents: PauseEvent[],
	urgeEvents: PauseEvent[] = [],
): ModuleSummary {
	const total = pauseEndEvents.length;
	const completed = pauseEndEvents.filter((e) => e.result === "COMPLETED").length;
	const gaveIn = pauseEndEvents.filter((e) => e.result === "GAVE_IN").length;
	const cancelled = pauseEndEvents.filter((e) => e.result === "CANCELLED").length;

	return {
		totalUrges: urgeEvents.length,
		pauseAttempts: total,
		pauseCompleted: completed,
		pauseGaveIn: gaveIn,
		pauseCancelled: cancelled,
		successRate: calculateSuccessRate(completed, total),
	};
}

export function calculateTodaySummary(
	events: PauseEvent[],
	dayKey: string,
	_dayAnchorMinutes: number = 240,
): TodaySummary {
	const dayEvents = events.filter((e) => e.localDayKey === dayKey);

	if (dayEvents.length === 0) {
		return createEmptyTodaySummary(dayKey);
	}

	const urgeEvents = dayEvents.filter((e) => e.eventType === "URGE");
	const pauseEndEvents = dayEvents.filter((e) => e.eventType === "PAUSE_END");

	const smokeUrges = urgeEvents.filter((e) => e.urgeType === "SMOKE");
	const snsUrges = urgeEvents.filter((e) => e.urgeType === "SNS");
	const smokePauseEnd = pauseEndEvents.filter((e) => e.urgeType === "SMOKE");
	const snsPauseEnd = pauseEndEvents.filter((e) => e.urgeType === "SNS");

	const totalPauseAttempts = pauseEndEvents.length;
	const totalCompleted = pauseEndEvents.filter((e) => e.result === "COMPLETED").length;
	const totalGaveIn = pauseEndEvents.filter((e) => e.result === "GAVE_IN").length;

	const currentStreak = calculateCurrentStreak(pauseEndEvents);

	const sortedEvents = [...dayEvents].sort(
		(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
	);
	const lastEvent = sortedEvents[sortedEvents.length - 1];

	return {
		dayKey,
		totalUrges: urgeEvents.length,
		pauseAttempts: totalPauseAttempts,
		pauseCompleted: totalCompleted,
		pauseGaveIn: totalGaveIn,
		successRate: calculateSuccessRate(totalCompleted, totalPauseAttempts),
		currentStreak,
		byType: {
			SMOKE: calculateModuleSummary(smokePauseEnd, smokeUrges),
			SNS: calculateModuleSummary(snsPauseEnd, snsUrges),
		},
		lastEventAt: lastEvent ? new Date(lastEvent.timestamp) : undefined,
	};
}

export function calculateDailySummary(events: PauseEvent[], dayKey: string): DailySummary {
	const dayEvents = events.filter((e) => e.localDayKey === dayKey);
	const pauseEndEvents = dayEvents.filter((e) => e.eventType === "PAUSE_END");

	const total = pauseEndEvents.length;
	const completed = pauseEndEvents.filter((e) => e.result === "COMPLETED").length;
	const gaveIn = pauseEndEvents.filter((e) => e.result === "GAVE_IN").length;

	return {
		dayKey,
		pauseAttempts: total,
		pauseCompleted: completed,
		pauseGaveIn: gaveIn,
		successRate: calculateSuccessRate(completed, total),
	};
}

export function calculateWeeklyReport(
	events: PauseEvent[],
	weekStartKey: string,
	_dayAnchorMinutes: number = 240,
): WeeklyReport {
	const weekDayKeys = getWeekDayKeys(weekStartKey);
	const weekEndKey = getWeekEndDayKey(weekStartKey);

	const weekEvents = events.filter((e) => weekDayKeys.includes(e.localDayKey));
	const pauseEndEvents = weekEvents.filter((e) => e.eventType === "PAUSE_END");

	const dailySummaries = weekDayKeys.map((dayKey) => calculateDailySummary(weekEvents, dayKey));

	const totalPauseAttempts = pauseEndEvents.length;
	const totalCompleted = pauseEndEvents.filter((e) => e.result === "COMPLETED").length;
	const totalGaveIn = pauseEndEvents.filter((e) => e.result === "GAVE_IN").length;

	const bestStreak = calculateBestStreak(pauseEndEvents);
	const preferredDuration = calculatePreferredDuration(pauseEndEvents);

	return {
		weekStartKey,
		weekEndKey,
		dailySummaries,
		totalPauseAttempts,
		totalCompleted,
		totalGaveIn,
		weeklySuccessRate: calculateSuccessRate(totalCompleted, totalPauseAttempts),
		bestStreak,
		preferredDuration,
	};
}

export function calculateBestStreak(pauseEndEvents: PauseEvent[]): number {
	const sorted = [...pauseEndEvents].sort(
		(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
	);

	let bestStreak = 0;
	let currentStreak = 0;

	for (const event of sorted) {
		if (event.result === "COMPLETED") {
			currentStreak++;
			if (currentStreak > bestStreak) {
				bestStreak = currentStreak;
			}
		} else {
			currentStreak = 0;
		}
	}

	return bestStreak;
}

export function calculatePreferredDuration(pauseEndEvents: PauseEvent[]): number | undefined {
	if (pauseEndEvents.length === 0) return undefined;

	const durationCounts: Record<number, number> = {};

	for (const event of pauseEndEvents) {
		if (event.pauseDuration) {
			durationCounts[event.pauseDuration] = (durationCounts[event.pauseDuration] || 0) + 1;
		}
	}

	const entries = Object.entries(durationCounts);
	if (entries.length === 0) return undefined;

	const [preferredDuration] = entries.reduce((max, current) =>
		current[1] > max[1] ? current : max,
	);

	return Number(preferredDuration);
}

export function filterEventsByDateRange(
	events: PauseEvent[],
	startDate: Date,
	endDate: Date,
): PauseEvent[] {
	return events.filter((e) => {
		const timestamp = new Date(e.timestamp);
		return timestamp >= startDate && timestamp < endDate;
	});
}

export function filterEventsByDayKey(events: PauseEvent[], dayKey: string): PauseEvent[] {
	return events.filter((e) => e.localDayKey === dayKey);
}

export function filterEventsByUrgeType(events: PauseEvent[], urgeType: UrgeType): PauseEvent[] {
	return events.filter((e) => e.urgeType === urgeType);
}

export function sortEventsByTimestamp(
	events: PauseEvent[],
	ascending: boolean = true,
): PauseEvent[] {
	return [...events].sort((a, b) => {
		const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
		return ascending ? diff : -diff;
	});
}
