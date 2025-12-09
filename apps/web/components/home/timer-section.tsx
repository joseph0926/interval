"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getMidnightKST } from "@/lib/date-utils";
import type { HomeState } from "@/types/home.type";

interface TimerSectionProps {
	state: HomeState;
	targetInterval: number;
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTimeFromMidnight(): string {
	const now = new Date();
	const midnight = getMidnightKST();
	const diffMs = now.getTime() - midnight.getTime();
	const diffMins = Math.floor(diffMs / 1000 / 60);
	const hours = Math.floor(diffMins / 60);
	const mins = diffMins % 60;
	return `${hours}시간 ${mins}분`;
}

export function TimerSection({ state, targetInterval }: TimerSectionProps) {
	const [remaining, setRemaining] = useState(
		state.type === "TIMER_RUNNING" ? state.remainingSeconds : 0,
	);

	useEffect(() => {
		if (state.type !== "TIMER_RUNNING") return;

		// eslint-disable-next-line
		setRemaining(state.remainingSeconds);

		const interval = setInterval(() => {
			setRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [state]);

	if (state.type === "BEFORE_FIRST") {
		return (
			<div className="flex flex-col items-center">
				<p className="text-muted-foreground">오늘 버틴 시간</p>
				<p className="mt-2 text-4xl font-bold tabular-nums">{formatTimeFromMidnight()}</p>
			</div>
		);
	}

	const progress = state.type === "TIMER_RUNNING" ? 1 - remaining / (targetInterval * 60) : 1;

	const circumference = 2 * Math.PI * 120;

	return (
		<div className="relative flex items-center justify-center">
			<svg width="280" height="280" className="-rotate-90">
				<circle
					cx="140"
					cy="140"
					r="120"
					fill="none"
					stroke="currentColor"
					strokeWidth="8"
					className="text-muted/30"
				/>
				<motion.circle
					cx="140"
					cy="140"
					r="120"
					fill="none"
					stroke="currentColor"
					strokeWidth="8"
					strokeLinecap="round"
					className="text-primary"
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: circumference * (1 - progress) }}
					style={{ strokeDasharray: circumference }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				/>
			</svg>
			<div className="absolute flex flex-col items-center">
				{state.type === "TARGET_REACHED" ? (
					<>
						<p className="text-lg text-muted-foreground">목표 달성!</p>
						<p className="mt-1 text-2xl font-bold text-primary">피워도 괜찮아요</p>
					</>
				) : (
					<>
						<p className="text-sm text-muted-foreground">남은 시간</p>
						<p className="mt-1 text-5xl font-bold tabular-nums">{formatTime(remaining)}</p>
						<p className="mt-2 text-sm text-muted-foreground">목표 {targetInterval}분</p>
					</>
				)}
			</div>
		</div>
	);
}
