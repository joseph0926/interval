import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { StepTransition } from "../step-transition";
import { ChevronLeft } from "lucide-react";
import type { DailySmokingRange } from "@/types/onboarding.type";

interface TargetIntervalStepProps {
	value: number;
	smokingRange: DailySmokingRange | null;
	onChange: (value: number) => void;
	onNext: () => void;
	onPrev: () => void;
}

function getRecommendedInterval(range: DailySmokingRange | null): number {
	switch (range) {
		case "UNDER_5":
			return 90;
		case "FROM_5_10":
			return 75;
		case "FROM_10_20":
			return 60;
		case "OVER_20":
			return 45;
		default:
			return 60;
	}
}

function getEstimatedCurrentInterval(range: DailySmokingRange | null): number {
	switch (range) {
		case "UNDER_5":
			return 120;
		case "FROM_5_10":
			return 90;
		case "FROM_10_20":
			return 50;
		case "OVER_20":
			return 30;
		default:
			return 60;
	}
}

export function TargetIntervalStep({
	value,
	smokingRange,
	onChange,
	onNext,
	onPrev,
}: TargetIntervalStepProps) {
	const recommended = getRecommendedInterval(smokingRange);
	const estimated = getEstimatedCurrentInterval(smokingRange);

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
						오늘 목표 간격을
						<br />
						정해볼까요?
					</h2>
					<p className="mt-3 leading-relaxed text-muted-foreground">
						지금 패턴 기준으로, 대략 {estimated}분 간격으로 피우고 계실 거예요.
						<br />
						<span className="font-medium text-foreground">{recommended}분 간격</span>
						부터 시작해보는 건 어떨까요?
					</p>
				</div>
				<div className="mt-12 flex flex-col items-center">
					<div className="text-6xl font-bold tabular-nums">
						{value}
						<span className="ml-1 text-2xl font-medium text-muted-foreground">분</span>
					</div>
					<div className="mt-10 w-full px-2">
						<Slider
							value={[value]}
							onValueChange={(values) => onChange(values[0])}
							min={30}
							max={120}
							step={5}
							className="w-full"
						/>
						<div className="mt-3 flex justify-between text-sm text-muted-foreground">
							<span>30분</span>
							<span>120분</span>
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
