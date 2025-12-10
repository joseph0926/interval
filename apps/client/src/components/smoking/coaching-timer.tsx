import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";

interface CoachingTimerProps {
	duration: number;
	onComplete: () => void;
}

export function CoachingTimer({ duration, onComplete }: CoachingTimerProps) {
	const [remaining, setRemaining] = useState(duration);
	const [breathPhase, setBreathPhase] = useState<"in" | "out">("in");
	const onCompleteRef = useRef(onComplete);

	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	useEffect(() => {
		if (remaining <= 0) {
			return;
		}

		const timer = setInterval(() => {
			setRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					setTimeout(() => {
						onCompleteRef.current();
					}, 0);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [remaining]);

	useEffect(() => {
		const breathTimer = setInterval(() => {
			setBreathPhase((prev) => (prev === "in" ? "out" : "in"));
		}, 5000);

		return () => clearInterval(breathTimer);
	}, []);

	const progress = 1 - remaining / duration;
	const circumference = 2 * Math.PI * 80;

	return (
		<div className="flex flex-col items-center gap-6 py-4">
			<div className="text-center">
				<h3 className="text-lg font-semibold">잠깐, 같이 호흡해요</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					{breathPhase === "in" ? "천천히 들이쉬세요..." : "천천히 내쉬세요..."}
				</p>
			</div>
			<div className="relative flex items-center justify-center">
				<svg width="200" height="200" className="-rotate-90">
					<circle
						cx="100"
						cy="100"
						r="80"
						fill="none"
						stroke="currentColor"
						strokeWidth="6"
						className="text-muted/30"
					/>
					<motion.circle
						cx="100"
						cy="100"
						r="80"
						fill="none"
						stroke="currentColor"
						strokeWidth="6"
						strokeLinecap="round"
						className="text-primary"
						initial={{ strokeDashoffset: circumference }}
						animate={{ strokeDashoffset: circumference * (1 - progress) }}
						style={{ strokeDasharray: circumference }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					/>
				</svg>
				<div className="absolute flex flex-col items-center">
					<motion.div
						animate={{
							scale: breathPhase === "in" ? 1.1 : 1,
						}}
						transition={{ duration: 5, ease: "easeInOut" }}
					>
						<p className="text-5xl font-bold tabular-nums">{remaining}</p>
					</motion.div>
					<p className="mt-1 text-sm text-muted-foreground">초</p>
				</div>
			</div>
			<div className="text-center">
				<p className="text-sm text-muted-foreground">5초 들이쉬고, 5초 내쉬기</p>
			</div>
		</div>
	);
}
