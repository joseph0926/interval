import { Card, CardContent } from "@/components/ui/card";
import { Cigarette, Clock, TrendingUp } from "lucide-react";
import type { TodaySummary } from "@/types/home.type";

interface TodaySummaryCardProps {
	summary: TodaySummary;
}

export function TodaySummaryCard({ summary }: TodaySummaryCardProps) {
	return (
		<Card>
			<CardContent className="grid grid-cols-3 gap-4 py-4">
				<div className="flex flex-col items-center gap-1">
					<Cigarette className="size-5 text-muted-foreground" />
					<p className="text-2xl font-bold">{summary.totalSmoked}</p>
					<p className="text-xs text-muted-foreground">오늘 개비</p>
				</div>
				<div className="flex flex-col items-center gap-1">
					<Clock className="size-5 text-muted-foreground" />
					<p className="text-2xl font-bold">
						{summary.averageInterval ?? "-"}
						<span className="text-sm font-normal text-muted-foreground">분</span>
					</p>
					<p className="text-xs text-muted-foreground">평균 간격</p>
				</div>
				<div className="flex flex-col items-center gap-1">
					<TrendingUp className="size-5 text-primary" />
					<p className="text-2xl font-bold text-primary">
						{summary.totalDelayMinutes}
						<span className="text-sm font-normal">분</span>
					</p>
					<p className="text-xs text-muted-foreground">벌어낸 거리</p>
				</div>
			</CardContent>
		</Card>
	);
}
