import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { StepTransition } from "../step-transition";
import { ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EngineModuleType } from "@/lib/api-types";

interface ModuleSelectStepProps {
	value: EngineModuleType[];
	onChange: (value: EngineModuleType[]) => void;
	onNext: () => void;
	onPrev: () => void;
}

const MODULE_OPTIONS: {
	value: EngineModuleType;
	emoji: string;
	label: string;
	description: string;
}[] = [
	{
		value: "SMOKE",
		emoji: "🚬",
		label: "담배",
		description: "담배 피우는 간격을 조절해요",
	},
	{
		value: "SNS",
		emoji: "📱",
		label: "SNS",
		description: "SNS 확인 간격을 조절해요",
	},
	{
		value: "CAFFEINE",
		emoji: "☕",
		label: "카페인",
		description: "커피 섭취 간격을 조절해요",
	},
	{
		value: "FOCUS",
		emoji: "🎯",
		label: "집중",
		description: "집중 시간을 관리해요",
	},
];

const MAX_MODULES = 2;

export function ModuleSelectStep({ value, onChange, onNext, onPrev }: ModuleSelectStepProps) {
	const handleToggle = (moduleType: EngineModuleType) => {
		if (value.includes(moduleType)) {
			onChange(value.filter((v) => v !== moduleType));
		} else if (value.length < MAX_MODULES) {
			onChange([...value, moduleType]);
		}
	};

	const canAddMore = value.length < MAX_MODULES;

	return (
		<StepTransition>
			<div className="flex flex-1 flex-col px-6 py-6">
				<button
					type="button"
					onClick={onPrev}
					className="-ml-2 flex items-center gap-1 self-start p-2 text-muted-foreground"
				>
					<ChevronLeft className="size-5" />
					<span className="text-sm">이전</span>
				</button>
				<div className="mt-8">
					<h2 className="text-2xl font-bold">
						어떤 것과 거리를 두고
						<br />
						싶으세요?
					</h2>
					<p className="mt-2 text-muted-foreground">최대 {MAX_MODULES}개까지 선택할 수 있어요.</p>
				</div>
				<div className="mt-8 flex flex-col gap-3">
					{MODULE_OPTIONS.map((option, index) => {
						const isSelected = value.includes(option.value);
						const isDisabled = !isSelected && !canAddMore;

						return (
							<motion.button
								key={option.value}
								type="button"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								whileTap={{ scale: isDisabled ? 1 : 0.98 }}
								onClick={() => !isDisabled && handleToggle(option.value)}
								disabled={isDisabled}
								className={cn(
									"flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-colors",
									isSelected
										? "border-primary bg-primary/5"
										: isDisabled
											? "cursor-not-allowed border-border bg-muted/50 opacity-50"
											: "border-border bg-card hover:border-primary/50",
								)}
							>
								<span className="text-2xl">{option.emoji}</span>
								<div className="flex-1">
									<p className="font-medium">{option.label}</p>
									<p className="text-sm text-muted-foreground">{option.description}</p>
								</div>
								{isSelected && (
									<div className="flex size-6 items-center justify-center rounded-full bg-primary">
										<Check className="size-4 text-primary-foreground" />
									</div>
								)}
							</motion.button>
						);
					})}
				</div>
				<div className="mt-auto pt-6">
					<Button
						size="lg"
						className="w-full rounded-xl py-6 text-base font-medium"
						onClick={onNext}
						disabled={value.length === 0}
					>
						다음
					</Button>
				</div>
			</div>
		</StepTransition>
	);
}
