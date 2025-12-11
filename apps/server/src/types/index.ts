import "@fastify/session";

declare module "@fastify/session" {
	interface FastifySessionObject {
		userId?: string;
	}
}

export type DailySmokingRange = "UNDER_5" | "FROM_5_10" | "FROM_10_20" | "OVER_20" | "UNKNOWN";
export type RecordType = "FIRST" | "NORMAL" | "EARLY";
export type ReasonCode =
	| "BREAK_TIME"
	| "STRESS"
	| "HABIT"
	| "BORED"
	| "SOCIAL"
	| "AFTER_MEAL"
	| "OTHER";
export type CoachingMode = "NONE" | "LIGHT" | "FULL";

export interface UserDto {
	id: string;
	isGuest: boolean;
	nickname: string | null;
	email?: string | null;
	dailySmokingRange?: DailySmokingRange | null;
	dayStartTime?: string;
	currentTargetInterval?: number;
	currentMotivation?: string | null;
}

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

export interface Settings {
	nickname: string | null;
	dailySmokingRange: DailySmokingRange | null;
	dayStartTime: string;
	currentTargetInterval: number;
	currentMotivation: string | null;
	notifyOnTargetTime: boolean;
	notifyMorningDelay: boolean;
	notifyDailyReminder: boolean;
}

export interface BadgeDefinition {
	type: string;
	name: string;
	description: string;
	condition: (totalDelayMinutes: number) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
	{
		type: "FIRST_DELAY",
		name: "첫 미루기",
		description: "처음으로 흡연을 미뤘습니다",
		condition: (m) => m >= 1,
	},
	{
		type: "DELAY_30",
		name: "30분 마스터",
		description: "총 30분 미루기 달성",
		condition: (m) => m >= 30,
	},
	{
		type: "DELAY_60",
		name: "1시간 챔피언",
		description: "총 1시간 미루기 달성",
		condition: (m) => m >= 60,
	},
	{
		type: "DELAY_180",
		name: "3시간 영웅",
		description: "총 3시간 미루기 달성",
		condition: (m) => m >= 180,
	},
	{
		type: "DELAY_360",
		name: "6시간 전설",
		description: "총 6시간 미루기 달성",
		condition: (m) => m >= 360,
	},
	{
		type: "DELAY_720",
		name: "12시간 신화",
		description: "총 12시간 미루기 달성",
		condition: (m) => m >= 720,
	},
];

export const LEVEL_THRESHOLDS = [0, 30, 60, 120, 240, 480, 960, 1920, 3840, 7680];

export function calculateLevel(totalDelayMinutes: number): number {
	for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
		if (totalDelayMinutes >= LEVEL_THRESHOLDS[i]) {
			return i + 1;
		}
	}
	return 1;
}

export const REASON_LABELS: Record<string, string> = {
	BREAK_TIME: "휴식 시간",
	STRESS: "스트레스",
	HABIT: "습관적으로",
	BORED: "지루해서",
	SOCIAL: "사회적 상황",
	AFTER_MEAL: "식사 후",
	OTHER: "기타",
};
