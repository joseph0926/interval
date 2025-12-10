import type { HomeState, TodaySummary } from "@/types/home.type";
import { formatDate } from "@/lib/date";

interface HomeHeaderProps {
	state: HomeState;
	summary: TodaySummary;
}

function getStatusMessage(state: HomeState, summary: TodaySummary): string {
	switch (state.type) {
		case "BEFORE_FIRST":
			return "오늘 담배와 거리 두기, 같이 시작해요.";
		case "TIMER_RUNNING":
			if (summary.averageInterval) {
				return `오늘 평균 간격: ${summary.averageInterval}분`;
			}
			return "첫 간격을 만들어가는 중이에요.";
		case "TARGET_REACHED":
			return "목표 시간이 지났어요. 이제 피워도 괜찮아요.";
	}
}

export function HomeHeader({ state, summary }: HomeHeaderProps) {
	const today = new Date();

	return (
		<div>
			<p className="text-sm text-muted-foreground">{formatDate(today)}</p>
			<h1 className="mt-1 text-xl font-semibold">{getStatusMessage(state, summary)}</h1>
		</div>
	);
}
