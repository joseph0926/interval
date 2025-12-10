import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REASON_OPTIONS } from "@/types/smoking.type";
import type { ReasonBreakdown } from "@/types/report.type";

interface ReasonCardProps {
	breakdown: ReasonBreakdown[];
}

export function ReasonCard({ breakdown }: ReasonCardProps) {
	if (breakdown.length === 0) {
		return (
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base">흡연 이유 분석</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">아직 데이터가 부족해요.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">흡연 이유 분석</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{breakdown.slice(0, 4).map((item) => {
					const reason = REASON_OPTIONS.find((r) => r.code === item.reasonCode);
					if (!reason) return null;

					return (
						<div key={item.reasonCode} className="flex items-center gap-3">
							<span className="text-lg">{reason.emoji}</span>
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<span className="text-sm">{reason.label}</span>
									<span className="text-sm font-medium">{item.percentage}%</span>
								</div>
								<div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
									<div
										className="h-full rounded-full bg-primary transition-all"
										style={{ width: `${item.percentage}%` }}
									/>
								</div>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
