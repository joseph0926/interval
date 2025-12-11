export type { DailySmokingRange, JobType, ModuleType, OnboardingInput } from "@/lib/api-types";
import type { DailySmokingRange, JobType, ModuleType } from "@/lib/api-types";

export interface OnboardingData {
	jobType: JobType | null;
	enabledModules: ModuleType[];
	dailySmokingRange: DailySmokingRange | null;
	targetInterval: number;
	motivation: string;
	dayStartTime: string;
	nickname: string;
}

export type OnboardingStep =
	| "welcome"
	| "job-type"
	| "module-select"
	| "day-start-time"
	| "smoking-amount"
	| "target-interval"
	| "motivation";

export interface JobTypeOption {
	value: JobType;
	label: string;
	description: string;
}

export interface ModuleOption {
	value: ModuleType;
	emoji: string;
	label: string;
	description: string;
}
