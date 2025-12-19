import { motion } from "motion/react";
import { Flame } from "lucide-react";
import type { PauseTodaySummary } from "@/lib/api-types";

interface TodayRecordCardProps {
	summary: PauseTodaySummary;
}

export function TodayRecordCard({ summary }: TodayRecordCardProps) {
	const successRateColor =
		summary.successRate >= 60
			? "text-success"
			: summary.successRate >= 40
				? "text-text-primary"
				: "text-warning";

	return (
		<div className="rounded-2xl bg-surface p-5 shadow-sm border border-border">
			<h3 className="text-sm font-medium text-text-secondary mb-4">오늘의 기록</h3>

			<div className="grid grid-cols-2 gap-4 mb-4">
				<div className="text-center">
					<p className="text-xs text-text-tertiary mb-1">멈춤 시도</p>
					<motion.p
						key={summary.pauseAttempts}
						initial={{ scale: 1.2, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="text-2xl font-bold text-text-primary tabular-nums"
					>
						{summary.pauseAttempts}회
					</motion.p>
				</div>
				<div className="text-center">
					<p className="text-xs text-text-tertiary mb-1">성공</p>
					<motion.p
						key={summary.pauseCompleted}
						initial={{ scale: 1.2, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="text-2xl font-bold text-text-primary tabular-nums"
					>
						{summary.pauseCompleted}회
						<span className={`text-sm font-normal ml-1 ${successRateColor}`}>
							({Math.round(summary.successRate)}%)
						</span>
					</motion.p>
				</div>
			</div>

			{summary.currentStreak >= 2 && (
				<div className="flex items-center justify-center gap-1.5 pt-3 border-t border-border">
					<Flame className="size-4 text-orange-500" />
					<span className="text-sm font-medium text-text-primary">
						연속 {summary.currentStreak}일째
					</span>
				</div>
			)}
		</div>
	);
}
