"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { HomeHeader } from "./home-header";
import { TimerSection } from "./timer-section";
import { TodaySummaryCard } from "./today-summary-card";
import { SmokingButton } from "./smoking-button";
import type { TodaySummary, HomeState } from "@/types/home.type";

interface HomeContentProps {
	summary: TodaySummary;
}

export function HomeContent({ summary }: HomeContentProps) {
	const homeState = useMemo((): HomeState => {
		if (!summary.lastSmokedAt) {
			return { type: "BEFORE_FIRST" };
		}

		const targetTime = new Date(
			summary.lastSmokedAt.getTime() + summary.targetInterval * 60 * 1000,
		);
		const now = new Date();
		const remainingMs = targetTime.getTime() - now.getTime();

		if (remainingMs <= 0) {
			return { type: "TARGET_REACHED" };
		}

		return {
			type: "TIMER_RUNNING",
			targetTime,
			remainingSeconds: Math.ceil(remainingMs / 1000),
		};
	}, [summary.lastSmokedAt, summary.targetInterval]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.15 }}
			className="flex flex-1 flex-col"
		>
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				className="px-6 pt-12"
			>
				<HomeHeader state={homeState} summary={summary} />
			</motion.div>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.1 }}
				className="flex flex-1 items-center justify-center px-6 py-8"
			>
				<TimerSection state={homeState} targetInterval={summary.targetInterval} />
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="px-6 pb-6"
			>
				<TodaySummaryCard summary={summary} />
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="px-6 pb-6"
			>
				<SmokingButton state={homeState} summary={summary} />
			</motion.div>
		</motion.div>
	);
}
