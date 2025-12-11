import type { ReasonCode, JobType, ModuleType } from "@/lib/api-types";
import type { JobTypeOption, ModuleOption } from "@/types/onboarding.type";

export const COACHING_TIMER_DURATION = 30;
export const DEFAULT_DELAY_MINUTES = 5;
export const DEFAULT_TARGET_INTERVAL = 60;
export const DEFAULT_DAY_START_TIME = "04:00";
export const MOTIVATION_MAX_LENGTH = 200;
export const DELAY_SUCCESS_THRESHOLD_MINUTES = 10;

export const IDLE_TIME_MIN_SECONDS = 5 * 60;
export const IDLE_TIME_MAX_SECONDS = 20 * 60;

export const LEVEL_THRESHOLDS = [0, 30, 60, 120, 240, 480, 960, 1920, 3840, 7680] as const;

export const REASON_LABELS: Record<ReasonCode, string> = {
	BREAK_TIME: "휴식 시간",
	STRESS: "스트레스",
	HABIT: "습관적으로",
	BORED: "지루해서",
	SOCIAL: "사회적 상황",
	AFTER_MEAL: "식사 후",
	OTHER: "기타",
};

export const JOB_TYPE_OPTIONS: JobTypeOption[] = [
	{ value: "OFFICE", label: "사무직", description: "오피스, 고정 출퇴근" },
	{ value: "REMOTE", label: "재택/프리랜서", description: "재택근무, 자유 일정" },
	{ value: "SHIFT", label: "교대/야간 근무", description: "교대제, 야간 근무" },
	{ value: "FIELD", label: "현장직", description: "외근, 현장 업무" },
	{ value: "OTHER", label: "기타", description: "그 외" },
];

export const MODULE_OPTIONS: ModuleOption[] = [
	{
		value: "SMOKING",
		emoji: "🚬",
		label: "담배 간격",
		description: "지금 한 개비 말고, 조금 있다가 한 개비",
	},
	{
		value: "SNS",
		emoji: "📱",
		label: "SNS/스크롤 간격",
		description: "지금 스크롤 말고, 조금 있다가 스크롤",
	},
	{
		value: "FOCUS",
		emoji: "💼",
		label: "집중 간격",
		description: "지금 딴짓 말고, 10분만 더 집중",
	},
	{
		value: "COFFEE",
		emoji: "☕",
		label: "커피/카페인 간격",
		description: "지금 커피 말고, 조금 있다가 커피",
	},
];

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

export const MODULE_EMOJIS: Record<ModuleType, string> = {
	SMOKING: "🚬",
	SNS: "📱",
	FOCUS: "💼",
	COFFEE: "☕",
};
