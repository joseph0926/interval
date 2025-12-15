import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { StepTransition } from "../step-transition";
import { NeonSurface } from "@/components/primitives";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IfThenStepProps {
	value: { trigger: string; action: string } | null;
	onChange: (value: { trigger: string; action: string }) => void;
	onNext: () => void;
	onPrev: () => void;
}

const TRIGGER_OPTIONS = [
	{ id: "stress", emoji: "😫", label: "스트레스 받을 때" },
	{ id: "bored", emoji: "🥱", label: "지루할 때" },
	{ id: "break", emoji: "☕️", label: "쉬는 시간에" },
	{ id: "after-meal", emoji: "🍽️", label: "식사 후에" },
	{ id: "social", emoji: "👫", label: "누군가와 함께 있을 때" },
] as const;

const ACTION_OPTIONS = [
	{ id: "breath", emoji: "🧘", label: "30초 심호흡하기" },
	{ id: "water", emoji: "💧", label: "물 한 잔 마시기" },
	{ id: "walk", emoji: "🚶", label: "잠깐 걷기" },
	{ id: "stretch", emoji: "🙆", label: "스트레칭하기" },
	{ id: "music", emoji: "🎵", label: "좋아하는 음악 듣기" },
] as const;

export function IfThenStep({ value, onChange, onNext, onPrev }: IfThenStepProps) {
	const prefersReducedMotion = useReducedMotion();
	const [selectedTrigger, setSelectedTrigger] = useState<string | null>(value?.trigger ?? null);
	const [selectedAction, setSelectedAction] = useState<string | null>(value?.action ?? null);

	const handleTriggerSelect = (triggerId: string) => {
		setSelectedTrigger(triggerId);
		if (selectedAction) {
			onChange({ trigger: triggerId, action: selectedAction });
		}
	};

	const handleActionSelect = (actionId: string) => {
		setSelectedAction(actionId);
		if (selectedTrigger) {
			onChange({ trigger: selectedTrigger, action: actionId });
		}
	};

	const canProceed = selectedTrigger && selectedAction;

	const getSelectedLabels = () => {
		const trigger = TRIGGER_OPTIONS.find((t) => t.id === selectedTrigger);
		const action = ACTION_OPTIONS.find((a) => a.id === selectedAction);
		return { trigger, action };
	};

	const { trigger, action } = getSelectedLabels();

	return (
		<StepTransition>
			<div className="flex flex-1 flex-col px-6 py-8">
				<button
					type="button"
					onClick={onPrev}
					className="mb-4 flex items-center gap-1 text-sm text-text-tertiary"
				>
					<ChevronLeft className="size-4" />
					<span>이전</span>
				</button>

				<motion.div
					initial={prefersReducedMotion ? undefined : { y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					className="mb-6"
				>
					<h2 className="text-xl font-semibold">나만의 전략 하나 만들기</h2>
					<p className="mt-2 text-sm text-text-secondary">
						"이럴 때 → 이렇게 하자" 계획을 세워보세요.
						<br />
						나중에 설정에서 수정할 수 있어요.
					</p>
				</motion.div>

				<div className="flex-1 space-y-6">
					{/* IF 섹션 */}
					<motion.div
						initial={prefersReducedMotion ? undefined : { y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1 }}
					>
						<p className="mb-3 text-sm font-medium text-text-secondary">
							<span className="rounded-md bg-primary/15 px-2 py-0.5 font-semibold text-primary">
								IF
							</span>{" "}
							이럴 때...
						</p>
						<div className="flex flex-wrap gap-2">
							{TRIGGER_OPTIONS.map((option) => (
								<OptionChip
									key={option.id}
									emoji={option.emoji}
									label={option.label}
									selected={selectedTrigger === option.id}
									variant="trigger"
									onClick={() => handleTriggerSelect(option.id)}
								/>
							))}
						</div>
					</motion.div>

					{/* THEN 섹션 */}
					<motion.div
						initial={prefersReducedMotion ? undefined : { y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						<p className="mb-3 text-sm font-medium text-text-secondary">
							<span className="rounded-md bg-success/15 px-2 py-0.5 font-semibold text-success">
								THEN
							</span>{" "}
							이렇게 하자!
						</p>
						<div className="flex flex-wrap gap-2">
							{ACTION_OPTIONS.map((option) => (
								<OptionChip
									key={option.id}
									emoji={option.emoji}
									label={option.label}
									selected={selectedAction === option.id}
									variant="action"
									onClick={() => handleActionSelect(option.id)}
								/>
							))}
						</div>
					</motion.div>

					{/* 나의 전략 요약 - Neon Surface */}
					{canProceed && trigger && action && (
						<motion.div
							initial={prefersReducedMotion ? undefined : { y: 10, opacity: 0, scale: 0.95 }}
							animate={{ y: 0, opacity: 1, scale: 1 }}
							transition={{ type: "spring", stiffness: 300, damping: 25 }}
						>
							<NeonSurface variant="neon" glow="success" className="p-4">
								<p className="text-xs font-medium text-text-tertiary">나의 전략</p>
								<div className="mt-2 flex items-center gap-2">
									<span className="text-lg">{trigger.emoji}</span>
									<span className="font-medium text-primary">{trigger.label}</span>
								</div>
								<div className="my-2 flex items-center gap-2 text-text-tertiary">
									<ArrowRight className="size-4" />
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg">{action.emoji}</span>
									<span className="font-medium text-success">{action.label}</span>
								</div>
							</NeonSurface>
						</motion.div>
					)}
				</div>

				<motion.div
					initial={prefersReducedMotion ? undefined : { y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="mt-6 flex flex-col gap-2"
				>
					<Button onClick={onNext} disabled={!canProceed} className="h-12 w-full">
						완료
					</Button>
					<Button variant="ghost" onClick={onNext} className="h-10 w-full text-text-tertiary">
						나중에 설정하기
					</Button>
				</motion.div>
			</div>
		</StepTransition>
	);
}

/** 옵션 칩 - Soft Neon 스타일 */
function OptionChip({
	emoji,
	label,
	selected,
	variant,
	onClick,
}: {
	emoji: string;
	label: string;
	selected: boolean;
	variant: "trigger" | "action";
	onClick: () => void;
}) {
	const isTrigger = variant === "trigger";

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-all",
				selected
					? isTrigger
						? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_15px_oklch(0.6_0.2_280/0.2)]"
						: "border-success/50 bg-success/15 text-success shadow-[0_0_15px_oklch(0.65_0.2_130/0.2)]"
					: "border-white/10 bg-surface-elevated hover:border-white/20 hover:bg-surface-elevated/80",
			)}
		>
			<span>{emoji}</span>
			<span>{label}</span>
		</button>
	);
}
