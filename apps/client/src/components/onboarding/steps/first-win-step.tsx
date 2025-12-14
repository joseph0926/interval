import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { StepTransition } from "../step-transition";
import { celebration, celebrationPulse } from "@/lib/motion";
import { Check, ChevronLeft } from "lucide-react";

interface FirstWinStepProps {
	onNext: () => void;
	onPrev: () => void;
}

type Phase = "intro" | "breathing" | "success";

export function FirstWinStep({ onNext, onPrev }: FirstWinStepProps) {
	const [phase, setPhase] = useState<Phase>("intro");
	const [seconds, setSeconds] = useState(30);
	const [breathPhase, setBreathPhase] = useState<"in" | "out">("in");

	const startBreathing = useCallback(() => {
		setPhase("breathing");
		setSeconds(30);
	}, []);

	useEffect(() => {
		if (phase !== "breathing") return;

		const breathInterval = setInterval(() => {
			setBreathPhase((prev) => (prev === "in" ? "out" : "in"));
		}, 4000);

		const countdownInterval = setInterval(() => {
			setSeconds((prev) => {
				if (prev <= 1) {
					clearInterval(countdownInterval);
					clearInterval(breathInterval);
					setPhase("success");
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			clearInterval(countdownInterval);
			clearInterval(breathInterval);
		};
	}, [phase]);

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

				{phase === "intro" && <IntroContent onStart={startBreathing} onSkip={onNext} />}
				{phase === "breathing" && (
					<BreathingContent seconds={seconds} breathPhase={breathPhase} onSkip={onNext} />
				)}
				{phase === "success" && <SuccessContent onNext={onNext} />}
			</div>
		</StepTransition>
	);
}

function IntroContent({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
	return (
		<div className="flex flex-1 flex-col">
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.4 }}
					className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10"
				>
					<span className="text-4xl">🧘</span>
				</motion.div>

				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<h2 className="text-xl font-semibold">첫 번째 미루기를 해볼까요?</h2>
					<p className="mt-2 text-sm text-text-secondary">
						30초만 호흡에 집중해보세요.
						<br />
						이게 바로 "간격 만들기"예요.
					</p>
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
					className="mt-4 text-xs text-text-tertiary"
				>
					충동과 행동 사이에 간격을 만드는 연습이에요
				</motion.p>
			</div>

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.4 }}
				className="flex flex-col gap-3 pt-6"
			>
				<Button onClick={onStart} className="h-12 w-full">
					30초 호흡 시작
				</Button>
				<Button onClick={onSkip} variant="ghost" className="h-11 w-full text-text-tertiary">
					나중에 해볼게요
				</Button>
			</motion.div>
		</div>
	);
}

function BreathingContent({
	seconds,
	breathPhase,
	onSkip,
}: {
	seconds: number;
	breathPhase: "in" | "out";
	onSkip: () => void;
}) {
	return (
		<div className="flex flex-1 flex-col">
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				<motion.div
					animate={{
						scale: breathPhase === "in" ? 1.2 : 1,
					}}
					transition={{
						duration: 4,
						ease: "easeInOut",
					}}
					className="mb-8 flex size-32 items-center justify-center rounded-full bg-primary/10"
				>
					<motion.span
						key={seconds}
						initial={{ scale: 1.2, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="text-5xl font-bold tabular-nums text-primary"
					>
						{seconds}
					</motion.span>
				</motion.div>

				<motion.p
					key={breathPhase}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-lg font-medium"
				>
					{breathPhase === "in" ? "들이쉬세요..." : "내쉬세요..."}
				</motion.p>

				<p className="mt-2 text-sm text-text-tertiary">충동이 지나가는 걸 느껴보세요</p>
			</div>

			<div className="pt-6">
				<Button onClick={onSkip} variant="ghost" className="h-11 w-full text-text-tertiary">
					건너뛰기
				</Button>
			</div>
		</div>
	);
}

function SuccessContent({ onNext }: { onNext: () => void }) {
	return (
		<div className="flex flex-1 flex-col">
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				<motion.div
					variants={celebration}
					initial="hidden"
					animate="visible"
					className="mb-6 flex size-20 items-center justify-center rounded-full bg-success-muted"
				>
					<Check className="size-10 text-success" />
				</motion.div>

				<motion.div variants={celebrationPulse} initial="initial" animate="pulse">
					<h2 className="text-xl font-semibold">첫 번째 간격을 만들었어요!</h2>
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="mt-2 text-sm text-text-secondary"
				>
					방금 30초의 거리를 벌었어요.
					<br />
					이런 작은 간격들이 모여 변화가 됩니다.
				</motion.p>
			</div>

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="pt-6"
			>
				<Button onClick={onNext} className="h-12 w-full">
					계속하기
				</Button>
			</motion.div>
		</div>
	);
}
