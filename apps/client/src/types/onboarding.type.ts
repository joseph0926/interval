export type { DailySmokingRange } from "@/lib/api-types";
import type { DailySmokingRange } from "@/lib/api-types";

export interface OnboardingData {
	dailySmokingRange: DailySmokingRange | null;
	targetInterval: number;
	motivation: string;
}

export type OnboardingStep = "welcome" | "smoking-amount" | "target-interval" | "motivation";
