import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { StepTransition } from "../step-transition";
import { NeonSurface } from "@/components/primitives";
import { celebration, celebrationPulse } from "@/lib/motion";
import { Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
	const prefersReducedMotion = useReducedMotion();

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				{/* 호흡 게이지 미리보기 - Soft Neon 스타일 */}
				<motion.div
					initial={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.4 }}
					className="mb-6"
				>
					<BreathingGauge progress={0} size={140}>
						<span className="text-4xl">🧘</span>
					</BreathingGauge>
				</motion.div>

				<motion.div
					initial={prefersReducedMotion ? undefined : { y: 20, opacity: 0 }}
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
					initial={prefersReducedMotion ? undefined : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
					className="mt-4 text-xs text-text-tertiary"
				>
					충동과 행동 사이에 간격을 만드는 연습이에요
				</motion.p>
			</div>

			<motion.div
				initial={prefersReducedMotion ? undefined : { y: 20, opacity: 0 }}
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
	const prefersReducedMotion = useReducedMotion();
	const progress = ((30 - seconds) / 30) * 100;

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				{/* 호흡 게이지 - 네온 글로우 + 스케일 애니메이션 */}
				<motion.div
					animate={
						prefersReducedMotion
							? undefined
							: {
									scale: breathPhase === "in" ? 1.1 : 1,
								}
					}
					transition={{
						duration: 4,
						ease: "easeInOut",
					}}
					className="mb-8"
				>
					<BreathingGauge progress={progress} size={160} animated>
						<motion.span
							key={seconds}
							initial={prefersReducedMotion ? undefined : { scale: 1.2, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="text-5xl font-bold tabular-nums text-focus"
						>
							{seconds}
						</motion.span>
					</BreathingGauge>
				</motion.div>

				<motion.p
					key={breathPhase}
					initial={prefersReducedMotion ? undefined : { opacity: 0 }}
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
	const prefersReducedMotion = useReducedMotion();

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				{/* 성공 게이지 - 네온 글로우 축하 효과 */}
				<motion.div
					variants={prefersReducedMotion ? undefined : celebration}
					initial="hidden"
					animate="visible"
					className="mb-6"
				>
					<NeonSurface
						variant="neon"
						glow="success"
						padding="none"
						className={cn(
							"flex size-24 items-center justify-center rounded-full",
							"bg-success/20 shadow-[0_0_40px_oklch(0.7_0.22_131.684/50%)]",
						)}
					>
						<Check className="size-12 text-success" />
					</NeonSurface>
				</motion.div>

				<motion.div
					variants={prefersReducedMotion ? undefined : celebrationPulse}
					initial="initial"
					animate="pulse"
				>
					<h2 className="text-xl font-semibold">첫 번째 간격을 만들었어요!</h2>
				</motion.div>

				<motion.div
					initial={prefersReducedMotion ? undefined : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="mt-4"
				>
					<NeonSurface
						variant="elevated"
						padding="none"
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
					>
						<span className="text-2xl">⏱️</span>
						<span className="font-semibold text-success">+30초</span>
						<span className="text-sm text-text-tertiary">벌었어요</span>
					</NeonSurface>
				</motion.div>

				<motion.p
					initial={prefersReducedMotion ? undefined : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="mt-4 text-sm text-text-secondary"
				>
					이런 작은 간격들이 모여 변화가 됩니다.
				</motion.p>
			</div>

			<motion.div
				initial={prefersReducedMotion ? undefined : { y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.6 }}
				className="pt-6"
			>
				<Button onClick={onNext} className="h-12 w-full">
					계속하기
				</Button>
			</motion.div>
		</div>
	);
}

/** 호흡 게이지 - Soft Neon 스타일 원형 프로그레스 */
function BreathingGauge({
	progress,
	size,
	animated = false,
	children,
}: {
	progress: number;
	size: number;
	animated?: boolean;
	children: React.ReactNode;
}) {
	const prefersReducedMotion = useReducedMotion();
	const shouldAnimate = animated && !prefersReducedMotion;

	const strokeWidth = 6;
	const radius = (size - strokeWidth * 2) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference * (1 - progress / 100);

	return (
		<div
			className="relative flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className={cn(
					"-rotate-90",
					shouldAnimate && "drop-shadow-[0_0_20px_oklch(0.7_0.25_304/60%)]",
				)}
			>
				{/* 배경 링 */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					className="stroke-muted/30"
				/>

				{/* 그라데이션 정의 */}
				<defs>
					<linearGradient id="breathing-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="oklch(0.65 0.25 290)" />
						<stop offset="100%" stopColor="oklch(0.72 0.25 310)" />
					</linearGradient>
				</defs>

				{/* 프로그레스 링 */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					stroke="url(#breathing-gradient)"
					strokeDasharray={circumference}
					initial={shouldAnimate ? { strokeDashoffset: circumference } : false}
					animate={{ strokeDashoffset }}
					transition={shouldAnimate ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
				/>
			</svg>

			{/* 중앙 콘텐츠 */}
			<div className="absolute inset-0 flex items-center justify-center">{children}</div>
		</div>
	);
}
