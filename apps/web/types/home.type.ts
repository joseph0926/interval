export interface TodaySummary {
	totalSmoked: number;
	averageInterval: number | null;
	totalDelayMinutes: number;
	lastSmokedAt: Date | null;
	targetInterval: number;
	motivation: string | null;
}

export type HomeState =
	| { type: "BEFORE_FIRST" }
	| { type: "TIMER_RUNNING"; targetTime: Date; remainingSeconds: number }
	| { type: "TARGET_REACHED" };
