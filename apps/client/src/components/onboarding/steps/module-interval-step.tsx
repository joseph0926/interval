import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { StepTransition } from "../step-transition";
import { ChevronLeft } from "lucide-react";
import type { EngineModuleType } from "@/lib/api-types";

interface ModuleIntervalStepProps {
	moduleType: EngineModuleType;
	value: number;
	onChange: (value: number) => void;
	onNext: () => void;
	onPrev: () => void;
}

const MODULE_CONFIG: Record<
	EngineModuleType,
	{
		emoji: string;
		label: string;
		title: string;
		description: string;
		defaultInterval: number;
		minInterval: number;
		maxInterval: number;
		step: number;
		unit: string;
	}
> = {
	SMOKE: {
		emoji: "🚬",
		label: "담배",
		title: "담배 간격을 정해볼까요?",
		description: "담배 피우는 간격을 얼마나 늘려볼까요?",
		defaultInterval: 60,
		minInterval: 30,
		maxInterval: 120,
		step: 5,
		unit: "분",
	},
	SNS: {
		emoji: "📱",
		label: "SNS",
		title: "SNS 확인 간격을 정해볼까요?",
		description: "무심코 SNS를 열어보는 습관, 조금씩 간격을 늘려봐요.",
		defaultInterval: 30,
		minInterval: 15,
		maxInterval: 120,
		step: 5,
		unit: "분",
	},
	CAFFEINE: {
		emoji: "☕",
		label: "카페인",
		title: "커피 간격을 정해볼까요?",
		description: "커피 한 잔과 다음 한 잔 사이, 얼마나 기다려볼까요?",
		defaultInterval: 180,
		minInterval: 60,
		maxInterval: 360,
		step: 30,
		unit: "분",
	},
	FOCUS: {
		emoji: "🎯",
		label: "집중",
		title: "집중 시간을 정해볼까요?",
		description: "한 번에 얼마나 집중해볼까요?",
		defaultInterval: 25,
		minInterval: 10,
		maxInterval: 90,
		step: 5,
		unit: "분",
	},
};

export function ModuleIntervalStep({
	moduleType,
	value,
	onChange,
	onNext,
	onPrev,
}: ModuleIntervalStepProps) {
	const config = MODULE_CONFIG[moduleType];

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
					<div className="mb-4 text-4xl">{config.emoji}</div>
					<h2 className="text-2xl font-bold">{config.title}</h2>
					<p className="mt-3 leading-relaxed text-muted-foreground">{config.description}</p>
				</div>
				<div className="mt-12 flex flex-col items-center">
					<div className="text-6xl font-bold tabular-nums">
						{value}
						<span className="ml-1 text-2xl font-medium text-muted-foreground">{config.unit}</span>
					</div>
					<div className="mt-10 w-full px-2">
						<Slider
							value={[value]}
							onValueChange={(values) => onChange(values[0])}
							min={config.minInterval}
							max={config.maxInterval}
							step={config.step}
							className="w-full"
						/>
						<div className="mt-3 flex justify-between text-sm text-muted-foreground">
							<span>
								{config.minInterval}
								{config.unit}
							</span>
							<span>
								{config.maxInterval}
								{config.unit}
							</span>
						</div>
					</div>
				</div>
				<p className="mt-8 text-center text-sm text-muted-foreground">
					나중에 언제든지 바꿀 수 있어요.
				</p>
				<div className="mt-auto pt-6">
					<Button
						size="lg"
						className="w-full rounded-xl py-6 text-base font-medium"
						onClick={onNext}
					>
						다음
					</Button>
				</div>
			</div>
		</StepTransition>
	);
}

export function getDefaultInterval(moduleType: EngineModuleType): number {
	return MODULE_CONFIG[moduleType].defaultInterval;
}
