import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { WelcomeStep } from "./steps/welcome-step";
import { ModuleSelectStep } from "./steps/module-select-step";
import { SmokingAmountStep } from "./steps/smoking-amount-step";
import { TargetIntervalStep } from "./steps/target-interval-step";
import { MotivationStep } from "./steps/motivation-step";
import { StepIndicator } from "./step-indicator";
import { api } from "@/lib/api";
import type { OnboardingData, OnboardingStep, DailySmokingRange } from "@/types/onboarding.type";
import type { EngineModuleType } from "@/lib/api-types";

interface OnboardingDataExtended extends OnboardingData {
	selectedModules: EngineModuleType[];
}

export function OnboardingFlow() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string>();
	const [data, setData] = useState<OnboardingDataExtended>({
		jobType: null,
		enabledModules: ["SMOKING"],
		dailySmokingRange: null,
		targetInterval: 60,
		motivation: "",
		dayStartTime: "04:00",
		nickname: "",
		selectedModules: [],
	});

	const steps = useMemo<OnboardingStep[]>(() => {
		const base: OnboardingStep[] = ["welcome", "module-select"];
		if (data.selectedModules.includes("SMOKE")) {
			base.push("smoking-amount", "target-interval");
		}
		base.push("motivation");
		return base;
	}, [data.selectedModules]);

	const stepIndex = steps.indexOf(currentStep);
	const isFirstStep = stepIndex === 0;
	const isLastStep = stepIndex === steps.length - 1;

	const goNext = async () => {
		if (!isLastStep) {
			setCurrentStep(steps[stepIndex + 1]);
		}
	};

	const handleStart = async () => {
		setIsPending(true);
		try {
			const meData = await api.auth.me();

			if (!meData.user) {
				await api.auth.guest();
			}

			goNext();
		} catch {
			setError("시작하는 중 오류가 발생했습니다. 다시 시도해주세요.");
		} finally {
			setIsPending(false);
		}
	};

	const goPrev = () => {
		if (!isFirstStep) {
			setCurrentStep(steps[stepIndex - 1]);
		}
	};

	const updateData = (partial: Partial<OnboardingDataExtended>) => {
		setData((prev) => ({ ...prev, ...partial }));
	};

	const handleSubmit = async () => {
		if (data.selectedModules.length === 0) return;

		setIsPending(true);
		setError(undefined);

		try {
			const modules = data.selectedModules.map((moduleType) => ({
				moduleType,
				enabled: true,
				targetIntervalMin:
					moduleType === "SMOKE"
						? data.targetInterval
						: moduleType === "SNS"
							? 30
							: moduleType === "CAFFEINE"
								? 180
								: 10,
			}));

			const res = await api.onboarding.complete({
				dailySmokingRange: data.selectedModules.includes("SMOKE")
					? (data.dailySmokingRange ?? undefined)
					: undefined,
				targetInterval: data.selectedModules.includes("SMOKE") ? data.targetInterval : undefined,
				motivation: data.motivation || undefined,
				modules,
			});

			if (!res.success) {
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

	const progressStepIndex = stepIndex > 0 ? stepIndex - 1 : 0;
	const progressTotal = steps.length - 1;

	return (
		<div className="flex min-h-dvh flex-col">
			{currentStep !== "welcome" && (
				<div className="px-6 pt-6">
					<StepIndicator current={progressStepIndex} total={progressTotal} />
				</div>
			)}
			<div className="flex flex-1 flex-col">
				<AnimatePresence mode="wait">
					{currentStep === "welcome" && (
						<WelcomeStep key="welcome" onNext={handleStart} isPending={isPending} />
					)}
					{currentStep === "module-select" && (
						<ModuleSelectStep
							key="module-select"
							value={data.selectedModules}
							onChange={(value: EngineModuleType[]) => updateData({ selectedModules: value })}
							onNext={goNext}
							onPrev={goPrev}
						/>
					)}
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
