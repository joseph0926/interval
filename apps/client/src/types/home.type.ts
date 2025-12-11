export type { TodaySummary } from "@/lib/api-types";

export type HomeState =
	| { type: "BEFORE_FIRST" }
	| { type: "TIMER_RUNNING"; targetTime: Date; remainingSeconds: number }
	| { type: "TARGET_REACHED" };
