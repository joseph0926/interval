import { Card, CardContent } from "@/components/ui/card";
import { Cigarette, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { WeeklySummary } from "@/types/report.type";

interface WeeklySummaryCardProps {
	summary: WeeklySummary;
}

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
	const diff =
		summary.averageInterval && summary.previousWeekAverageInterval
			? summary.averageInterval - summary.previousWeekAverageInterval
			: null;

	return (
		<Card>
			<CardContent className="py-4">
				<div className="grid grid-cols-3 gap-4">
					<div className="flex flex-col items-center gap-1">
						<Clock className="size-5 text-muted-foreground" />
						<div className="flex items-baseline gap-1">
							<p className="text-2xl font-bold">{summary.averageInterval ?? "-"}</p>
							<span className="text-sm text-muted-foreground">분</span>
						</div>
						<p className="text-xs text-muted-foreground">평균 간격</p>
						{diff !== null && (
							<div className="flex items-center gap-0.5 text-xs">
								{diff > 0 ? (
									<>
										<TrendingUp className="size-3 text-primary" />
										<span className="text-primary">+{diff}분</span>
									</>
								) : diff < 0 ? (
									<>
										<TrendingDown className="size-3 text-destructive" />
										<span className="text-destructive">{diff}분</span>
									</>
								) : (
									<>
										<Minus className="size-3 text-muted-foreground" />
										<span className="text-muted-foreground">동일</span>
									</>
								)}
							</div>
						)}
					</div>
					<div className="flex flex-col items-center gap-1">
						<Cigarette className="size-5 text-muted-foreground" />
						<div className="flex items-baseline gap-1">
							<p className="text-2xl font-bold">{summary.totalSmoked}</p>
							<span className="text-sm text-muted-foreground">개비</span>
						</div>
						<p className="text-xs text-muted-foreground">이번 주</p>
					</div>
					<div className="flex flex-col items-center gap-1">
						<TrendingUp className="size-5 text-primary" />
						<div className="flex items-baseline gap-1">
							<p className="text-2xl font-bold text-primary">{summary.totalDelayMinutes}</p>
							<span className="text-sm text-primary">분</span>
						</div>
						<p className="text-xs text-muted-foreground">벌어낸 거리</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
