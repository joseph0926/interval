import type { BadgeDefinition, ReasonCode, JobType, ModuleType } from "../types/index.js";

export const MS_PER_MINUTE = 60_000;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_DAYS = 30;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_DAYS * MS_PER_DAY;

export const DEFAULT_TARGET_INTERVAL = 60;
export const DEFAULT_DAY_START_TIME = "04:00";
export const MOTIVATION_MAX_LENGTH = 200;
export const DELAY_SUCCESS_THRESHOLD_MINUTES = 10;

export const LEVEL_THRESHOLDS = [0, 30, 60, 120, 240, 480, 960, 1920, 3840, 7680] as const;

export function calculateLevel(totalDelayMinutes: number): number {
	for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
		if (totalDelayMinutes >= LEVEL_THRESHOLDS[i]) {
			return i + 1;
		}
	}
	return 1;
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

export const REASON_LABELS: Record<ReasonCode, string> = {
	BREAK_TIME: "휴식 시간",
	STRESS: "스트레스",
	HABIT: "습관적으로",
	BORED: "지루해서",
	SOCIAL: "사회적 상황",
	AFTER_MEAL: "식사 후",
	OTHER: "기타",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
	OFFICE: "사무직",
	REMOTE: "재택/프리랜서",
	SHIFT: "교대/야간 근무",
	FIELD: "현장직",
	OTHER: "기타",
};

export const MODULE_LABELS: Record<ModuleType, string> = {
	SMOKING: "담배 간격",
	SNS: "SNS/스크롤 간격",
	FOCUS: "집중 간격",
	COFFEE: "커피/카페인 간격",
};

export const DEFAULT_ENABLED_MODULES: ModuleType[] = ["SMOKING"];
