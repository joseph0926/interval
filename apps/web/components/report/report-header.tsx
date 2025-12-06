interface ReportHeaderProps {
	streakDays: number;
}

function getWeekRange(): string {
	const now = new Date();
	const dayOfWeek = now.getDay();
	const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	const monday = new Date(now);
	monday.setDate(now.getDate() - diffToMonday);

	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	const format = (d: Date) =>
		new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(d);

	return `${format(monday)} - ${format(sunday)}`;
}

export function ReportHeader({ streakDays }: ReportHeaderProps) {
	return (
		<div>
			<p className="text-sm text-muted-foreground">{getWeekRange()}</p>
			<h1 className="mt-1 text-xl font-semibold">주간 리포트</h1>
			{streakDays > 0 && (
				<p className="mt-2 text-sm text-primary">미루기 연속 {streakDays}일째예요 👏</p>
			)}
		</div>
	);
}
