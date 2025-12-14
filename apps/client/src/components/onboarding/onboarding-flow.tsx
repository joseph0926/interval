import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { WelcomeStep } from "./steps/welcome-step";
import { ModuleSelectStep } from "./steps/module-select-step";
import { SmokingAmountStep } from "./steps/smoking-amount-step";
import { ModuleIntervalStep, getDefaultInterval } from "./steps/module-interval-step";
import { MotivationStep } from "./steps/motivation-step";
import { FirstWinStep } from "./steps/first-win-step";
import { IfThenStep } from "./steps/if-then-step";
import { StepIndicator } from "./step-indicator";
import { api } from "@/lib/api";
import type { DailySmokingRange } from "@/types/onboarding.type";
import type { EngineModuleType } from "@/lib/api-types";

type OnboardingStep =
	| "welcome"
	| "first-win"
	| "module-select"
	| "smoking-amount"
	| `interval-${EngineModuleType}`
	| "if-then"
	| "motivation";

interface ModuleIntervalData {
	SMOKE: number;
	SNS: number;
	CAFFEINE: number;
	FOCUS: number;
}

interface IfThenPlan {
	trigger: string;
	action: string;
}

interface OnboardingDataState {
	selectedModules: EngineModuleType[];
	dailySmokingRange: DailySmokingRange | null;
	moduleIntervals: ModuleIntervalData;
	motivation: string;
	ifThenPlan: IfThenPlan | null;
}

export function OnboardingFlow() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string>();
	const [data, setData] = useState<OnboardingDataState>({
		selectedModules: [],
		dailySmokingRange: null,
		moduleIntervals: {
			SMOKE: 60,
			SNS: 30,
			CAFFEINE: 180,
			FOCUS: 25,
		},
		motivation: "",
		ifThenPlan: null,
	});

	const steps = useMemo<OnboardingStep[]>(() => {
		const result: OnboardingStep[] = ["welcome", "first-win", "module-select"];

		if (data.selectedModules.includes("SMOKE")) {
			result.push("smoking-amount");
		}

		for (const moduleType of data.selectedModules) {
			result.push(`interval-${moduleType}` as OnboardingStep);
		}

		result.push("if-then");
		result.push("motivation");
		return result;
	}, [data.selectedModules]);

	const stepIndex = steps.indexOf(currentStep);
	const isFirstStep = stepIndex === 0;
	const isLastStep = stepIndex === steps.length - 1;

	const goNext = () => {
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

	const updateModuleInterval = (moduleType: EngineModuleType, value: number) => {
		setData((prev) => ({
			...prev,
			moduleIntervals: {
				...prev.moduleIntervals,
				[moduleType]: value,
			},
		}));
	};

	const handleModuleSelect = (modules: EngineModuleType[]) => {
		setData((prev) => {
			const newIntervals = { ...prev.moduleIntervals };
			for (const moduleType of modules) {
				if (!prev.selectedModules.includes(moduleType)) {
					newIntervals[moduleType] = getDefaultInterval(moduleType);
				}
			}
			return {
				...prev,
				selectedModules: modules,
				moduleIntervals: newIntervals,
			};
		});
	};

	const handleSubmit = async () => {
		if (data.selectedModules.length === 0) return;

		setIsPending(true);
		setError(undefined);

		try {
			const modules = data.selectedModules.map((moduleType) => ({
				moduleType,
				enabled: true,
				targetIntervalMin: data.moduleIntervals[moduleType],
			}));

			const res = await api.onboarding.complete({
				dailySmokingRange: data.selectedModules.includes("SMOKE")
					? (data.dailySmokingRange ?? undefined)
					: undefined,
				targetInterval: data.selectedModules.includes("SMOKE")
					? data.moduleIntervals.SMOKE
					: undefined,
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

	const renderIntervalStep = (moduleType: EngineModuleType) => (
		<ModuleIntervalStep
			key={`interval-${moduleType}`}
			moduleType={moduleType}
			value={data.moduleIntervals[moduleType]}
			onChange={(value) => updateModuleInterval(moduleType, value)}
			onNext={goNext}
			onPrev={goPrev}
		/>
	);

	const showStepIndicator = currentStep !== "welcome" && currentStep !== "first-win";

	return (
		<div className="flex min-h-dvh flex-col">
			{showStepIndicator && (
				<div className="px-6 pt-6">
					<StepIndicator current={progressStepIndex} total={progressTotal} />
				</div>
			)}
			<div className="flex flex-1 flex-col">
				<AnimatePresence mode="wait">
					{currentStep === "welcome" && (
						<WelcomeStep key="welcome" onNext={handleStart} isPending={isPending} />
					)}
					{currentStep === "first-win" && (
						<FirstWinStep key="first-win" onNext={goNext} onPrev={goPrev} />
					)}
					{currentStep === "module-select" && (
						<ModuleSelectStep
							key="module-select"
							value={data.selectedModules}
							onChange={handleModuleSelect}
							onNext={goNext}
							onPrev={goPrev}
						/>
					)}
					{currentStep === "smoking-amount" && (
						<SmokingAmountStep
							key="smoking-amount"
							value={data.dailySmokingRange}
							onChange={(value: DailySmokingRange) =>
								setData((prev) => ({ ...prev, dailySmokingRange: value }))
							}
							onNext={goNext}
							onPrev={goPrev}
						/>
					)}
					{currentStep === "interval-SMOKE" && renderIntervalStep("SMOKE")}
					{currentStep === "interval-SNS" && renderIntervalStep("SNS")}
					{currentStep === "interval-CAFFEINE" && renderIntervalStep("CAFFEINE")}
					{currentStep === "interval-FOCUS" && renderIntervalStep("FOCUS")}
					{currentStep === "if-then" && (
						<IfThenStep
							key="if-then"
							value={data.ifThenPlan}
							onChange={(value) => setData((prev) => ({ ...prev, ifThenPlan: value }))}
							onNext={goNext}
							onPrev={goPrev}
						/>
					)}
					{currentStep === "motivation" && (
						<MotivationStep
							key="motivation"
							value={data.motivation}
							onChange={(value: string) => setData((prev) => ({ ...prev, motivation: value }))}
							onSubmit={handleSubmit}
							isPending={isPending}
							error={error}
							onPrev={goPrev}
							selectedModules={data.selectedModules}
						/>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
