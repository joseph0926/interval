export interface TodaySummary {
	totalSmoked: number;
	averageInterval: number | null;
	totalDelayMinutes: number;
	targetInterval: number;
	motivation: string | null;
	lastSmokedAt: string | null;
	firstSmokedAt: string | null;
	nextTargetTime: string | null;
	earlyCount: number;
	dayStartTime: string;
}

export type HomeState =
	| { type: "BEFORE_FIRST" }
	| { type: "TIMER_RUNNING"; targetTime: Date; remainingSeconds: number }
	| { type: "TARGET_REACHED" };
