import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PauseUrgeType, PauseDuration } from "@/lib/api-types";

interface BreathingTimerProps {
	urgeType: PauseUrgeType;
	duration: PauseDuration;
	onComplete: () => void;
	onCancel: () => void;
}

const BREATH_CYCLE = {
	inhale: 4000,
	hold: 4000,
	exhale: 6000,
};

const TOTAL_CYCLE = BREATH_CYCLE.inhale + BREATH_CYCLE.hold + BREATH_CYCLE.exhale;

type BreathPhase = "inhale" | "hold" | "exhale";

const BREATH_LABELS: Record<BreathPhase, string> = {
	inhale: "들숨...",
	hold: "참기...",
	exhale: "날숨...",
};

const REFLECTION_QUESTIONS = {
	SMOKE: [
		"지금 피우면 어떤 기분일까요?",
		"3개월 전의 나에게 뭐라고 할까요?",
		"이 충동은 잠깐입니다. 지나갈 거예요.",
		"왜 금연을 시작했는지 떠올려보세요.",
		"물 한 잔 마시면 어떨까요?",
	],
	SNS: [
		"지금 꼭 봐야 하나요?",
		"뭘 찾으려고 열었나요?",
		"5분 후에 어떤 기분일까요?",
		"이 시간에 뭘 하고 싶었나요?",
		"스크롤은 언제든 할 수 있어요.",
	],
};

function getBreathPhase(elapsedMs: number): { phase: BreathPhase; progress: number } {
	const cyclePosition = elapsedMs % TOTAL_CYCLE;

	if (cyclePosition < BREATH_CYCLE.inhale) {
		return { phase: "inhale", progress: cyclePosition / BREATH_CYCLE.inhale };
	} else if (cyclePosition < BREATH_CYCLE.inhale + BREATH_CYCLE.hold) {
		return {
			phase: "hold",
			progress: (cyclePosition - BREATH_CYCLE.inhale) / BREATH_CYCLE.hold,
		};
	} else {
		return {
			phase: "exhale",
			progress: (cyclePosition - BREATH_CYCLE.inhale - BREATH_CYCLE.hold) / BREATH_CYCLE.exhale,
		};
	}
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function BreathingTimer({ urgeType, duration, onComplete, onCancel }: BreathingTimerProps) {
	const [remainingSeconds, setRemainingSeconds] = useState<number>(duration);
	const [elapsedMs, setElapsedMs] = useState(0);
	const [showCancelConfirm, setShowCancelConfirm] = useState(false);

	const question = useMemo(() => {
		const questions = REFLECTION_QUESTIONS[urgeType];
		return questions[Math.floor(Math.random() * questions.length)];
	}, [urgeType]);

	const breathState = useMemo(() => getBreathPhase(elapsedMs), [elapsedMs]);

	const circleScale = useMemo(() => {
		const { phase, progress } = breathState;
		if (phase === "inhale") {
			return 0.85 + progress * 0.3;
		} else if (phase === "hold") {
			return 1.15;
		} else {
			return 1.15 - progress * 0.3;
		}
	}, [breathState]);

	useEffect(() => {
		const startTime = Date.now();
		const endTime = startTime + duration * 1000;

		const interval = setInterval(() => {
			const now = Date.now();
			const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
			const elapsed = now - startTime;

			setRemainingSeconds(remaining);
			setElapsedMs(elapsed);

			if (remaining <= 0) {
				clearInterval(interval);
				onComplete();
			}
		}, 50);

		return () => clearInterval(interval);
	}, [duration, onComplete]);

	const handleBackPress = useCallback(() => {
		setShowCancelConfirm(true);
	}, []);

	const handleConfirmCancel = useCallback(() => {
		onCancel();
	}, [onCancel]);

	const handleDismissCancel = useCallback(() => {
		setShowCancelConfirm(false);
	}, []);

	return (
		<div className="fixed inset-0 z-50 bg-background flex flex-col">
			<div className="flex-1 flex flex-col items-center justify-center px-6">
				{/* Breathing Circle */}
				<div className="relative mb-8">
					<motion.div
						animate={{ scale: circleScale }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="size-56 rounded-full bg-primary/10 flex items-center justify-center"
					>
						<motion.div
							animate={{ scale: circleScale }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
							className="size-44 rounded-full bg-primary/20 flex items-center justify-center"
						>
							<div className="text-center">
								<p className="text-5xl font-bold text-text-primary tabular-nums font-sora">
									{formatTime(remainingSeconds)}
								</p>
							</div>
						</motion.div>
					</motion.div>
				</div>

				{/* Breath Phase Label */}
				<AnimatePresence mode="wait">
					<motion.p
						key={breathState.phase}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="text-lg text-primary font-medium mb-8"
					>
						{BREATH_LABELS[breathState.phase]}
					</motion.p>
				</AnimatePresence>

				{/* Divider */}
				<div className="w-full max-w-xs h-px bg-border mb-6" />

				{/* Reflection Question */}
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="text-center text-text-secondary max-w-xs"
				>
					"{question}"
				</motion.p>
			</div>

			{/* Back Button */}
			<div className="px-6 pb-8">
				<button onClick={handleBackPress} className="w-full py-4 text-text-tertiary text-sm">
					취소하기
				</button>
			</div>

			{/* Cancel Confirmation Modal */}
			<AnimatePresence>
				{showCancelConfirm && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center px-6"
						onClick={handleDismissCancel}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-lg"
						>
							<h3 className="text-lg font-semibold text-text-primary text-center mb-2">
								정말 취소할까요?
							</h3>
							<p className="text-sm text-text-secondary text-center mb-6">
								조금만 더 버텨보세요. 거의 다 왔어요.
							</p>
							<div className="flex gap-3">
								<button
									onClick={handleDismissCancel}
									className="flex-1 py-3 rounded-xl bg-primary text-white font-medium"
								>
									계속하기
								</button>
								<button
									onClick={handleConfirmCancel}
									className="flex-1 py-3 rounded-xl bg-muted text-text-secondary font-medium"
								>
									취소
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
