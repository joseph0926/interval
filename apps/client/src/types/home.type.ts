export type { TodaySummary, DistanceBank } from "@/lib/api-types";

export type HomeState =
	| { type: "BEFORE_FIRST" }
	| { type: "TIMER_RUNNING"; targetTime: Date; remainingSeconds: number }
	| { type: "TARGET_REACHED" }
	| { type: "IDLE_TIME"; targetTime: Date; remainingSeconds: number };
