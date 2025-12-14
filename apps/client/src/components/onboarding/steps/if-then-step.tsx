import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { StepTransition } from "../step-transition";
import { ChevronLeft } from "lucide-react";

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

				<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
					<h2 className="text-xl font-semibold">나만의 전략 하나 만들기</h2>
					<p className="mt-2 text-sm text-text-secondary">
						"이럴 때 → 이렇게 하자" 계획을 세워보세요.
						<br />
						나중에 설정에서 수정할 수 있어요.
					</p>
				</motion.div>

				<div className="flex-1 space-y-6">
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1 }}
					>
						<p className="mb-3 text-sm font-medium text-text-secondary">
							<span className="text-primary">IF</span> 이럴 때...
						</p>
						<div className="flex flex-wrap gap-2">
							{TRIGGER_OPTIONS.map((option) => (
								<button
									key={option.id}
									type="button"
									onClick={() => handleTriggerSelect(option.id)}
									className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-all ${
										selectedTrigger === option.id
											? "border-primary bg-primary/10 text-primary"
											: "border-border bg-surface hover:border-primary/50"
									}`}
								>
									<span>{option.emoji}</span>
									<span>{option.label}</span>
								</button>
							))}
						</div>
					</motion.div>

					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						<p className="mb-3 text-sm font-medium text-text-secondary">
							<span className="text-success">THEN</span> 이렇게 하자!
						</p>
						<div className="flex flex-wrap gap-2">
							{ACTION_OPTIONS.map((option) => (
								<button
									key={option.id}
									type="button"
									onClick={() => handleActionSelect(option.id)}
									className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-all ${
										selectedAction === option.id
											? "border-success bg-success-muted text-success"
											: "border-border bg-surface hover:border-success/50"
									}`}
								>
									<span>{option.emoji}</span>
									<span>{option.label}</span>
								</button>
							))}
						</div>
					</motion.div>

					{canProceed && trigger && action && (
						<motion.div
							initial={{ y: 10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							className="rounded-xl bg-surface-elevated p-4"
						>
							<p className="text-sm text-text-tertiary">나의 전략</p>
							<p className="mt-1 font-medium">
								<span className="text-primary">{trigger.label}</span>
								{" → "}
								<span className="text-success">{action.label}</span>
							</p>
						</motion.div>
					)}
				</div>

				<motion.div
					initial={{ y: 20, opacity: 0 }}
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
