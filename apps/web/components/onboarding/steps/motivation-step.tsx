"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StepTransition } from "../step-transition";
import { ChevronLeft } from "lucide-react";
import { notifyOnboardingComplete } from "@/lib/native-bridge";
import type { OnboardingData } from "../onboarding-flow";

interface MotivationStepProps {
	value: string;
	onChange: (value: string) => void;
	formAction: (formData: FormData) => void;
	isPending: boolean;
	error?: string;
	onboardingData: OnboardingData;
	onPrev: () => void;
}

const PLACEHOLDERS = [
	"기침이 너무 심해서 조금 줄이고 싶어요.",
	"아이 앞에서 냄새를 줄이고 싶어요.",
	"건강검진 전에 조금이라도 줄여보고 싶어요.",
];

export function MotivationStep({
	value,
	onChange,
	formAction,
	isPending,
	error,
	onboardingData,
	onPrev,
}: MotivationStepProps) {
	const handleSubmit = (formData: FormData) => {
		notifyOnboardingComplete();
		formAction(formData);
	};

	return (
		<StepTransition>
			<form action={handleSubmit} className="flex flex-1 flex-col px-6 py-6">
				<input
					type="hidden"
					name="dailySmokingRange"
					value={onboardingData.dailySmokingRange ?? ""}
				/>
				<input type="hidden" name="targetInterval" value={onboardingData.targetInterval} />
				<input type="hidden" name="motivation" value={value} />
				<button
					type="button"
					onClick={onPrev}
					className="flex items-center gap-1 text-muted-foreground self-start -ml-2 p-2"
				>
					<ChevronLeft className="size-5" />
					<span className="text-sm">이전</span>
				</button>
				<div className="mt-8">
					<h2 className="text-2xl font-bold">
						오늘 이렇게 해보고 싶은
						<br />
						이유를 적어볼까요?
					</h2>
					<p className="mt-2 text-muted-foreground">이 문장은 힘들 때 다시 보여드릴게요.</p>
				</div>
				<div className="mt-8">
					<Textarea
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder={PLACEHOLDERS[0]}
						className="min-h-32 resize-none rounded-xl text-base"
					/>
				</div>
				<div className="mt-6 flex flex-wrap gap-2">
					{PLACEHOLDERS.map((placeholder) => (
						<button
							key={placeholder}
							type="button"
							onClick={() => onChange(placeholder)}
							className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/50 transition-colors"
						>
							{placeholder.slice(0, 15)}...
						</button>
					))}
				</div>
				{error && <p className="mt-4 text-sm text-destructive">{error}</p>}
				<div className="mt-auto pt-6">
					<Button
						type="submit"
						size="lg"
						className="w-full rounded-xl py-6 text-base font-medium"
						disabled={isPending}
					>
						{isPending ? "잠시만요..." : "시작하기"}
					</Button>
					<Button
						type="submit"
						variant="ghost"
						className="mt-3 w-full text-sm text-muted-foreground"
						disabled={isPending}
					>
						나중에 적을게요
					</Button>
				</div>
			</form>
		</StepTransition>
	);
}
