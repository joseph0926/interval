import { motion } from "motion/react";
import { ReportHeader } from "./report-header";
import { WeeklySummaryCard } from "./weekly-summary-card";
import { IntervalChart } from "./interval-chart";
import { ReasonCard } from "./reason-card";
import { InsightCard } from "./insight-card";
import { fadeIn, slideUp, createStaggeredDelay } from "@/lib/motion";
import type { ReportData } from "@/types/report.type";

interface ReportContentProps {
	data: ReportData;
}

export function ReportContent({ data }: ReportContentProps) {
	return (
		<motion.div
			variants={fadeIn}
			initial="hidden"
			animate="visible"
			className="flex flex-1 flex-col"
		>
			<motion.div variants={slideUp} initial="hidden" animate="visible" className="px-6 pt-12">
				<ReportHeader streakDays={data.streakDays} />
			</motion.div>
			<div className="flex flex-col gap-4 px-6 py-6">
				<motion.div
					variants={slideUp}
					initial="hidden"
					animate="visible"
					transition={createStaggeredDelay(0)}
				>
					<WeeklySummaryCard summary={data.weeklySummary} />
				</motion.div>
				<motion.div
					variants={slideUp}
					initial="hidden"
					animate="visible"
					transition={createStaggeredDelay(1)}
				>
					<IntervalChart dailyIntervals={data.dailyIntervals} />
				</motion.div>
				<motion.div
					variants={slideUp}
					initial="hidden"
					animate="visible"
					transition={createStaggeredDelay(2)}
				>
					<ReasonCard breakdown={data.reasonBreakdown} />
				</motion.div>
				<motion.div
					variants={slideUp}
					initial="hidden"
					animate="visible"
					transition={createStaggeredDelay(3)}
				>
					<InsightCard data={data} />
				</motion.div>
			</div>
		</motion.div>
	);
}
