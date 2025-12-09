import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayIndexKST } from "@/lib/date-utils";
import type { DailyIntervalData } from "@/types/report.type";

interface IntervalChartProps {
	dailyIntervals: DailyIntervalData[];
}

export function IntervalChart({ dailyIntervals }: IntervalChartProps) {
	const maxInterval = Math.max(...dailyIntervals.map((d) => d.averageInterval ?? 0), 60);
	const todayIndex = getTodayIndexKST();

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">요일별 평균 간격</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex h-32 items-end justify-between gap-2">
					{dailyIntervals.map((day, index) => {
						const height = day.averageInterval ? (day.averageInterval / maxInterval) * 100 : 0;
						const isToday = index === todayIndex;
						const isFuture = index > todayIndex;

						return (
							<div key={day.dayOfWeek} className="flex flex-1 flex-col items-center gap-2">
								<div className="relative flex h-24 w-full items-end justify-center">
									{!isFuture && (
										<div
											className={`w-full max-w-8 rounded-t-md transition-all ${
												isToday ? "bg-primary" : "bg-primary/40"
											}`}
											style={{ height: `${Math.max(height, 4)}%` }}
										/>
									)}
									{day.averageInterval && !isFuture && (
										<span className="absolute -top-5 text-xs font-medium">
											{day.averageInterval}
										</span>
									)}
								</div>
								<span
									className={`text-xs ${
										isToday ? "font-semibold text-primary" : "text-muted-foreground"
									}`}
								>
									{day.dayOfWeek}
								</span>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
