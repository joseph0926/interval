import { formatWeekRange } from "@/lib/date";

interface ReportHeaderProps {
	streakDays: number;
}

export function ReportHeader({ streakDays }: ReportHeaderProps) {
	return (
		<div>
			<p className="text-sm text-muted-foreground">{formatWeekRange()}</p>
			<h1 className="mt-1 text-xl font-semibold">주간 리포트</h1>
			{streakDays > 0 && (
				<p className="mt-2 text-sm text-primary">미루기 연속 {streakDays}일째예요 👏</p>
			)}
		</div>
	);
}
