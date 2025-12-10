import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { REASON_OPTIONS } from "@/types/smoking.type";
import type { ReportData } from "@/types/report.type";

interface InsightCardProps {
	data: ReportData;
}

function formatHour(hour: number): string {
	if (hour < 12) return `오전 ${hour === 0 ? 12 : hour}시`;
	return `오후 ${hour === 12 ? 12 : hour - 12}시`;
}

function generateInsights(data: ReportData): string[] {
	const insights: string[] = [];

	if (data.peakHours.length > 0) {
		const peakHour = data.peakHours[0];
		insights.push(
			`최근 7일 동안, ${formatHour(peakHour.hour)}~${formatHour(peakHour.hour + 1)} 사이에 담배를 가장 많이 피웠어요.`,
		);
	}

	if (data.reasonBreakdown.length > 0) {
		const topReason = data.reasonBreakdown[0];
		const reasonLabel = REASON_OPTIONS.find((r) => r.code === topReason.reasonCode)?.label;
		if (reasonLabel) {
			insights.push(`"${reasonLabel}" 때문에 피운 비율이 ${topReason.percentage}%예요.`);
		}
	}

	const { weeklySummary } = data;
	if (
		weeklySummary.averageInterval &&
		weeklySummary.previousWeekAverageInterval &&
		weeklySummary.averageInterval > weeklySummary.previousWeekAverageInterval
	) {
		const diff = weeklySummary.averageInterval - weeklySummary.previousWeekAverageInterval;
		insights.push(`지난주보다 평균 간격이 ${diff}분 늘었어요. 잘하고 있어요!`);
	}

	if (weeklySummary.totalDelayMinutes > 0) {
		insights.push(`이번 주에 담배와 총 ${weeklySummary.totalDelayMinutes}분의 거리를 벌렸어요.`);
	}

	return insights.length > 0 ? insights : ["데이터가 쌓이면 더 정확한 인사이트를 보여드릴게요."];
}

export function InsightCard({ data }: InsightCardProps) {
	const insights = generateInsights(data);

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Lightbulb className="size-4 text-primary" />
					패턴 인사이트
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				{insights.map((insight, index) => (
					<p key={index} className="text-sm text-muted-foreground">
						• {insight}
					</p>
				))}
			</CardContent>
		</Card>
	);
}
