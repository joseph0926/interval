import { motion } from "motion/react";
import { Clock } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { PauseUrgeType, PauseDuration } from "@/lib/api-types";

interface TimerSelectDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	urgeType: PauseUrgeType | null;
	onSelect: (duration: PauseDuration) => void;
}

const DURATION_OPTIONS: Array<{
	value: PauseDuration;
	label: string;
	description: string;
	recommended?: boolean;
}> = [
	{
		value: 90,
		label: "90초",
		description: "가벼운 충동일 때",
		recommended: true,
	},
	{
		value: 180,
		label: "3분",
		description: "강한 충동일 때",
	},
];

const URGE_LABELS = {
	SMOKE: "담배",
	SNS: "SNS",
} as const;

export function TimerSelectDrawer({
	open,
	onOpenChange,
	urgeType,
	onSelect,
}: TimerSelectDrawerProps) {
	const handleSelect = (duration: PauseDuration) => {
		onSelect(duration);
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="text-center">
					<DrawerTitle className="text-xl font-semibold">잠깐 멈춰볼까요?</DrawerTitle>
					{urgeType && (
						<p className="text-sm text-text-secondary mt-1">
							{URGE_LABELS[urgeType]} 충동이 느껴지시는군요
						</p>
					)}
				</DrawerHeader>

				<div className="px-6 pb-8 space-y-3">
					{DURATION_OPTIONS.map((option) => (
						<motion.button
							key={option.value}
							whileTap={{ scale: 0.98 }}
							onClick={() => handleSelect(option.value)}
							className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-colors ${
								option.recommended
									? "border-primary bg-primary/5 hover:bg-primary/10"
									: "border-border bg-surface hover:bg-surface-hover"
							}`}
						>
							<div
								className={`size-12 rounded-full flex items-center justify-center ${
									option.recommended ? "bg-primary/10" : "bg-muted"
								}`}
							>
								<Clock
									className={`size-6 ${option.recommended ? "text-primary" : "text-text-secondary"}`}
								/>
							</div>
							<div className="flex-1 text-left">
								<div className="flex items-center gap-2">
									<p className="text-lg font-semibold text-text-primary">{option.label}</p>
									{option.recommended && (
										<span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
											추천
										</span>
									)}
								</div>
								<p className="text-sm text-text-secondary">{option.description}</p>
							</div>
						</motion.button>
					))}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
