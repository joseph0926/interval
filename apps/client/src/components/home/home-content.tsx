import { useMemo, useState, useCallback } from "react";
import { motion } from "motion/react";
import { useSyncedModel } from "@firsttx/local-first";
import { HomeHeader } from "./home-header";
import { TimerSection } from "./timer-section";
import { TodaySummaryCard } from "./today-summary-card";
import { SmokingButton } from "./smoking-button";
import { SmokingDrawer } from "@/components/smoking/smoking-drawer";
import { TodaySummaryModel } from "@/models/today-summary.model";
import { api } from "@/lib/api";
import { getTargetTime, getRemainingSeconds } from "@/lib/interval";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { HomeState } from "@/types/home.type";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchTodaySummary() {
	const json = await api.smoking.today();
	return json.data;
}

export function HomeContent() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const {
		data: summary,
		status,
		sync,
	} = useSyncedModel(TodaySummaryModel, fetchTodaySummary, {
		syncOnMount: "always",
	});

	const homeState = useMemo((): HomeState => {
		if (!summary?.lastSmokedAt) {
			return { type: "BEFORE_FIRST" };
		}

		const targetTime = getTargetTime(summary.lastSmokedAt, summary.targetInterval);
		const remainingSeconds = getRemainingSeconds(summary.lastSmokedAt, summary.targetInterval);

		if (!targetTime || remainingSeconds <= 0) {
			return { type: "TARGET_REACHED" };
		}

		return {
			type: "TIMER_RUNNING",
			targetTime,
			remainingSeconds,
		};
	}, [summary?.lastSmokedAt, summary?.targetInterval]);

	const handleSmokingPress = useCallback(() => {
		setIsDrawerOpen(true);
	}, []);

	const handleDrawerOpenChange = useCallback(
		(open: boolean) => {
			setIsDrawerOpen(open);
			if (!open) {
				sync();
			}
		},
		[sync],
	);

	if (status === "loading" || !summary) {
		return <HomeContentSkeleton />;
	}

	return (
		<>
			<motion.div
				variants={staggerContainer}
				initial="hidden"
				animate="visible"
				className="flex flex-1 flex-col"
			>
				<motion.div variants={staggerItem} className="px-6 pt-12">
					<HomeHeader state={homeState} summary={summary} />
				</motion.div>

				<motion.div
					variants={staggerItem}
					className="flex flex-1 items-center justify-center px-6 py-8"
				>
					<TimerSection state={homeState} targetInterval={summary.targetInterval} />
				</motion.div>

				<motion.div variants={staggerItem} className="px-6 pb-6">
					<TodaySummaryCard summary={summary} />
				</motion.div>

				<motion.div variants={staggerItem} className="px-6 pb-6">
					<SmokingButton state={homeState} onPress={handleSmokingPress} />
				</motion.div>
			</motion.div>

			<SmokingDrawer
				open={isDrawerOpen}
				onOpenChange={handleDrawerOpenChange}
				state={homeState}
				summary={summary}
			/>
		</>
	);
}

function HomeContentSkeleton() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="px-6 pt-12">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="mt-2 h-6 w-64" />
			</div>
			<div className="flex flex-1 items-center justify-center px-6 py-8">
				<Skeleton className="size-[280px] rounded-full" />
			</div>
			<div className="px-6 pb-6">
				<Skeleton className="h-24 w-full rounded-xl" />
			</div>
			<div className="px-6 pb-6">
				<Skeleton className="h-14 w-full rounded-xl" />
			</div>
		</div>
	);
}
