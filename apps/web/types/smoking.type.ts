import type { ReasonCode } from "@/prisma/generated/prisma/enums";

export interface ReasonOption {
	code: ReasonCode;
	emoji: string;
	label: string;
}

export const REASON_OPTIONS: ReasonOption[] = [
	{ code: "STRESS", emoji: "😫", label: "스트레스/짜증" },
	{ code: "HABIT", emoji: "😐", label: "그냥 습관처럼" },
	{ code: "BORED", emoji: "🥱", label: "너무 지루해서" },
	{ code: "SOCIAL", emoji: "👫", label: "같이 피우자는 사람이 있어서" },
	{ code: "AFTER_MEAL", emoji: "🍺", label: "밥/술 후라서" },
	{ code: "OTHER", emoji: "✏️", label: "기타" },
];
