export type DailySmokingRange = "UNDER_5" | "FROM_5_10" | "FROM_10_20" | "OVER_20" | "UNKNOWN";

export interface OnboardingData {
	dailySmokingRange: DailySmokingRange | null;
	targetInterval: number;
	motivation: string;
}

export type OnboardingStep = "welcome" | "smoking-amount" | "target-interval" | "motivation";
