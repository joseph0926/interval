import { motion } from "motion/react";
import { Cigarette, Smartphone } from "lucide-react";
import type { PauseUrgeType } from "@/lib/api-types";

interface UrgeButtonProps {
	urgeType: PauseUrgeType;
	onPress: (urgeType: PauseUrgeType) => void;
}

const URGE_CONFIG = {
	SMOKE: {
		icon: Cigarette,
		label: "담배",
		description: "충동 버튼",
		bgClass: "bg-accent-smoke/10 hover:bg-accent-smoke/15",
		iconClass: "text-accent-smoke",
	},
	SNS: {
		icon: Smartphone,
		label: "SNS",
		description: "충동 버튼",
		bgClass: "bg-accent-sns/10 hover:bg-accent-sns/15",
		iconClass: "text-accent-sns",
	},
} as const;

export function UrgeButton({ urgeType, onPress }: UrgeButtonProps) {
	const config = URGE_CONFIG[urgeType];
	const Icon = config.icon;

	return (
		<motion.button
			whileTap={{ scale: 0.98 }}
			onClick={() => onPress(urgeType)}
			className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-6 transition-colors ${config.bgClass} min-h-[120px] flex-1`}
		>
			<Icon className={`size-8 ${config.iconClass}`} />
			<div className="text-center">
				<p className="text-base font-semibold text-text-primary">{config.label}</p>
				<p className="text-xs text-text-tertiary">{config.description}</p>
			</div>
		</motion.button>
	);
}

interface UrgeButtonGroupProps {
	enabledModules: PauseUrgeType[];
	onPress: (urgeType: PauseUrgeType) => void;
}

export function UrgeButtonGroup({ enabledModules, onPress }: UrgeButtonGroupProps) {
	return (
		<div className="space-y-3">
			<p className="text-center text-sm text-text-secondary">충동이 오셨나요?</p>
			<div className="flex gap-3">
				{enabledModules.map((urgeType) => (
					<UrgeButton key={urgeType} urgeType={urgeType} onPress={onPress} />
				))}
			</div>
		</div>
	);
}
