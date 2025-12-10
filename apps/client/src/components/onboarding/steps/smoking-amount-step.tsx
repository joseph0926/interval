import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { StepTransition } from "../step-transition";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailySmokingRange } from "@/types/onboarding.type";

interface SmokingAmountStepProps {
	value: DailySmokingRange | null;
	onChange: (value: DailySmokingRange) => void;
	onNext: () => void;
	onPrev: () => void;
}

const OPTIONS: { value: DailySmokingRange; label: string }[] = [
	{ value: "UNDER_5", label: "5개비 미만" },
	{ value: "FROM_5_10", label: "5~10개비" },
	{ value: "FROM_10_20", label: "10~20개비" },
	{ value: "OVER_20", label: "20개비 이상" },
	{ value: "UNKNOWN", label: "잘 모르겠어요" },
];

export function SmokingAmountStep({ value, onChange, onNext, onPrev }: SmokingAmountStepProps) {
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
						하루에 보통 몇 개비 정도
						<br />
						피우시나요?
					</h2>
					<p className="mt-2 text-muted-foreground">정확하지 않아도 괜찮아요.</p>
				</div>
				<div className="mt-8 flex flex-col gap-3">
					{OPTIONS.map((option, index) => (
						<motion.button
							key={option.value}
							type="button"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => onChange(option.value)}
							className={cn(
								"rounded-xl border px-5 py-4 text-left text-base font-medium transition-colors",
								value === option.value
									? "border-primary bg-primary/5 text-primary"
									: "border-border bg-card hover:border-primary/50",
							)}
						>
							{option.label}
						</motion.button>
					))}
				</div>
				<div className="mt-auto pt-6">
					<Button
						size="lg"
						className="w-full rounded-xl py-6 text-base font-medium"
						onClick={onNext}
						disabled={!value}
					>
						다음
					</Button>
				</div>
			</div>
		</StepTransition>
	);
}
