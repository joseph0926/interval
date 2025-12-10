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

export interface ReasonOption {
	code: ReasonCode;
	emoji: string;
	label: string;
}

export const REASON_OPTIONS: ReasonOption[] = [
	{ code: "BREAK_TIME", emoji: "⏸", label: "쉬는 시간이라서" },
	{ code: "STRESS", emoji: "😫", label: "스트레스/짜증" },
	{ code: "HABIT", emoji: "😐", label: "그냥 습관처럼" },
	{ code: "BORED", emoji: "🥱", label: "너무 지루해서" },
	{ code: "SOCIAL", emoji: "👫", label: "같이 피우자는 사람이 있어서" },
	{ code: "AFTER_MEAL", emoji: "🍺", label: "밥/술 후라서" },
	{ code: "OTHER", emoji: "✏️", label: "기타" },
];

export interface RecordSmokingInput {
	smokedAt?: Date;
	type: RecordType;
	reasonCode?: ReasonCode;
	reasonText?: string | null;
	coachingMode?: CoachingMode;
	emotionNote?: string;
	delayedMinutes?: number;
}

export interface RecordSmokingResult {
	success: boolean;
	error?: string;
	data?: {
		intervalFromPrevious: number | null;
		wasOnTarget: boolean | null;
	};
}
