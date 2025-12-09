"use client";

import { motion } from "motion/react";
import { ReportHeader } from "./report-header";
import { WeeklySummaryCard } from "./weekly-summary-card";
import { IntervalChart } from "./interval-chart";
import { ReasonCard } from "./reason-card";
import { InsightCard } from "./insight-card";
import type { ReportData } from "@/types/report.type";

interface ReportContentProps {
	data: ReportData;
}

export function ReportContent({ data }: ReportContentProps) {
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
				<ReportHeader streakDays={data.streakDays} />
			</motion.div>
			<div className="flex flex-col gap-4 px-6 py-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<WeeklySummaryCard summary={data.weeklySummary} />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<IntervalChart dailyIntervals={data.dailyIntervals} />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<ReasonCard breakdown={data.reasonBreakdown} />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<InsightCard data={data} />
				</motion.div>
			</div>
		</motion.div>
	);
}
