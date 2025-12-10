import type { InferResponseType } from "hono/client";
import type { api } from "@/lib/api";

type TodayResponse = InferResponseType<typeof api.api.smoking.today.$get>;

export type TodaySummary = TodayResponse["data"];

export type HomeState =
	| { type: "BEFORE_FIRST" }
	| { type: "TIMER_RUNNING"; targetTime: Date; remainingSeconds: number }
	| { type: "TARGET_REACHED" };
