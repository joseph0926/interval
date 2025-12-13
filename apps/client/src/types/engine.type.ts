export type {
	EngineModuleType,
	EngineModuleStatus,
	EngineModuleState,
	EngineTodaySummary,
	EngineIntegratedSummary,
	EngineReasonLabel,
	EngineTriggerContext,
} from "@/lib/api-types";

export type ModuleCardState =
	| { type: "NO_BASELINE" }
	| { type: "COUNTDOWN"; targetTime: Date; remainingSeconds: number }
	| { type: "READY" }
	| { type: "GAP_DETECTED" };

export interface ModuleConfig {
	moduleType: "SMOKE" | "SNS" | "CAFFEINE" | "FOCUS";
	label: string;
	icon: string;
	actionLabel: string;
	urgeLabel: string;
	color: string;
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
		actionLabel: "시작/종료",
		urgeLabel: "집중하기",
		color: "text-purple-500",
	},
};
