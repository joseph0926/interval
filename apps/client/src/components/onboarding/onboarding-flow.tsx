import { useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { WelcomeStep } from "./steps/welcome-step";
import { SmokingAmountStep } from "./steps/smoking-amount-step";
import { TargetIntervalStep } from "./steps/target-interval-step";
import { MotivationStep } from "./steps/motivation-step";
import { StepIndicator } from "./step-indicator";
import { api } from "@/lib/api";
import type { OnboardingData, OnboardingStep, DailySmokingRange } from "@/types/onboarding.type";

const STEPS: OnboardingStep[] = ["welcome", "smoking-amount", "target-interval", "motivation"];

export function OnboardingFlow() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string>();
	const [data, setData] = useState<OnboardingData>({
		dailySmokingRange: null,
		targetInterval: 60,
		motivation: "",
	});

	const stepIndex = STEPS.indexOf(currentStep);
	const isFirstStep = stepIndex === 0;
	const isLastStep = stepIndex === STEPS.length - 1;

	const goNext = () => {
		if (!isLastStep) {
			setCurrentStep(STEPS[stepIndex + 1]);
		}
	};

	const goPrev = () => {
		if (!isFirstStep) {
			setCurrentStep(STEPS[stepIndex - 1]);
		}
	};

	const updateData = (partial: Partial<OnboardingData>) => {
		setData((prev) => ({ ...prev, ...partial }));
	};

	const handleSubmit = async () => {
		if (!data.dailySmokingRange) return;

		setIsPending(true);
		setError(undefined);

		try {
			const res = await api.api.onboarding.complete.$post({
				json: {
					dailySmokingRange: data.dailySmokingRange,
					targetInterval: data.targetInterval,
					motivation: data.motivation || undefined,
				},
			});

			if (!res.ok) {
				throw new Error("온보딩 저장에 실패했습니다");
			}

			toast.success("설정이 완료되었어요!");
			navigate("/");
		} catch {
			setError("저장에 실패했습니다. 다시 시도해주세요.");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="flex min-h-dvh flex-col">
			{currentStep !== "welcome" && (
				<div className="px-6 pt-6">
					<StepIndicator current={stepIndex - 1} total={STEPS.length - 1} />
				</div>
			)}
			<div className="flex flex-1 flex-col">
				<AnimatePresence mode="wait">
					{currentStep === "welcome" && <WelcomeStep key="welcome" onNext={goNext} />}
					{currentStep === "smoking-amount" && (
						<SmokingAmountStep
							key="smoking-amount"
							value={data.dailySmokingRange}
							onChange={(value: DailySmokingRange) => updateData({ dailySmokingRange: value })}
							onNext={goNext}
							onPrev={goPrev}
						/>
					)}
					{currentStep === "target-interval" && (
						<TargetIntervalStep
							key="target-interval"
							value={data.targetInterval}
							smokingRange={data.dailySmokingRange}
							onChange={(value: number) => updateData({ targetInterval: value })}
							onNext={goNext}
							onPrev={goPrev}
						/>
					)}
					{currentStep === "motivation" && (
						<MotivationStep
							key="motivation"
							value={data.motivation}
							onChange={(value: string) => updateData({ motivation: value })}
							onSubmit={handleSubmit}
							isPending={isPending}
							error={error}
							onPrev={goPrev}
						/>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
