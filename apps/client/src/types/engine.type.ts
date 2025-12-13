export type {
	EngineModuleType,
	EngineModuleStatus,
	EngineModuleState,
	EngineTodaySummary,
	EngineIntegratedSummary,
	EngineReasonLabel,
	EngineTriggerContext,
	EngineFloatingSuggestion,
	EngineFocusSessionInfo,
	EngineActionKind,
	EngineSessionEndReason,
	EngineCtaKey,
} from "@/lib/api-types";

export type ModuleCardState =
	| { type: "NO_BASELINE" }
	| { type: "COUNTDOWN"; targetTime: Date; remainingSeconds: number }
	| { type: "READY" }
	| { type: "GAP_DETECTED" }
	| { type: "FOCUS_IDLE" }
	| { type: "FOCUS_RUNNING"; elapsedSeconds: number; remainingSeconds: number }
	| { type: "FOCUS_COACHING" };

export interface ModuleConfig {
	moduleType: "SMOKE" | "SNS" | "CAFFEINE" | "FOCUS";
	label: string;
	icon: string;
	actionLabel: string;
	urgeLabel: string;
	color: string;
	isSessionBased?: boolean;
}

export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
	SMOKE: {
		moduleType: "SMOKE",
		label: "담배",
		icon: "🚬",
		actionLabel: "피웠어요",
		urgeLabel: "피우고 싶어요",
		color: "text-orange-500",
	},
	SNS: {
		moduleType: "SNS",
		label: "SNS",
		icon: "📱",
		actionLabel: "봤어요",
		urgeLabel: "보고 싶어요",
		color: "text-blue-500",
	},
	CAFFEINE: {
		moduleType: "CAFFEINE",
		label: "카페인",
		icon: "☕",
		actionLabel: "마셨어요",
		urgeLabel: "마시고 싶어요",
		color: "text-amber-600",
	},
	FOCUS: {
		moduleType: "FOCUS",
		label: "집중",
		icon: "🎯",
		actionLabel: "세션 종료",
		urgeLabel: "딴짓하고 싶어요",
		color: "text-purple-500",
		isSessionBased: true,
	},
};

export const INTERVAL_MODULES = ["SMOKE", "SNS", "CAFFEINE"] as const;
export const SESSION_MODULES = ["FOCUS"] as const;

export function isIntervalModule(moduleType: string): boolean {
	return INTERVAL_MODULES.includes(moduleType as (typeof INTERVAL_MODULES)[number]);
}

export function isSessionModule(moduleType: string): boolean {
	return SESSION_MODULES.includes(moduleType as (typeof SESSION_MODULES)[number]);
}

export function isFocusStatus(status: string): boolean {
	return status === "FOCUS_IDLE" || status === "FOCUS_RUNNING" || status === "FOCUS_COACHING";
}
