import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import type { EngineIntegratedSummary } from "@/types/engine.type";

interface BentoSummaryCardProps {
	integrated: EngineIntegratedSummary;
	streak?: number;
	nextMilestone?: number;
}

export function IntegratedSummaryCard({ integrated }: { integrated: EngineIntegratedSummary }) {
	return <BentoSummaryCard integrated={integrated} />;
}

export function BentoSummaryCard({ integrated, streak = 0, nextMilestone }: BentoSummaryCardProps) {
	const netIsPositive = integrated.netMin >= 0;
	const milestone = nextMilestone ?? getNextMilestone(integrated.netMin);

	return (
		<div className="grid grid-cols-2 gap-3">
			<Card className="col-span-2 border-0 bg-surface p-4 shadow-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-text-tertiary">오늘의 순거리</p>
						<div className="mt-1 flex items-baseline gap-1">
							<span
								className={`text-4xl font-bold tabular-nums ${netIsPositive ? "text-earned" : "text-lost"}`}
								role="text"
								aria-label={`순거리 ${netIsPositive ? "플러스" : "마이너스"} ${Math.abs(integrated.netMin)}분`}
							>
								{netIsPositive ? "+" : ""}
								{integrated.netMin}
							</span>
							<span className="text-lg text-text-secondary">분</span>
						</div>
					</div>
					<NetIndicator value={integrated.netMin} />
				</div>
			</Card>

			<Card className="border-0 bg-surface p-3 shadow-sm">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-success-muted">
						<TrendingUp className="size-4 text-success" aria-hidden="true" />
					</div>
					<div>
						<p className="text-xs text-text-tertiary">적립</p>
						<p className="text-lg font-semibold tabular-nums text-earned">
							+{integrated.earnedMin}
							<span className="text-sm font-normal text-text-tertiary">분</span>
						</p>
					</div>
				</div>
			</Card>

			<Card className="border-0 bg-surface p-3 shadow-sm">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-danger-muted">
						<TrendingDown className="size-4 text-danger" aria-hidden="true" />
					</div>
					<div>
						<p className="text-xs text-text-tertiary">차감</p>
						<p className="text-lg font-semibold tabular-nums text-lost">
							-{integrated.lostMin}
							<span className="text-sm font-normal text-text-tertiary">분</span>
						</p>
					</div>
				</div>
			</Card>

			{(streak > 0 || milestone > 0) && (
				<Card className="col-span-2 border-0 bg-surface-elevated p-3 shadow-sm">
					<div className="flex items-center justify-between">
						{streak > 0 && (
							<div className="flex items-center gap-2">
								<Zap className="size-4 text-celebration" aria-hidden="true" />
								<span className="text-sm text-text-secondary">
									<span className="font-semibold text-foreground">{streak}일</span> 연속 달성 중
								</span>
							</div>
						)}
						{milestone > 0 && integrated.netMin < milestone && (
							<div className="text-right text-sm text-text-tertiary">
								<span className="font-medium text-text-secondary">
									{milestone - integrated.netMin}분
								</span>{" "}
								더 벌면 <span className="font-medium text-primary">{milestone}분</span> 달성
							</div>
						)}
					</div>
				</Card>
			)}
		</div>
	);
}

function NetIndicator({ value }: { value: number }) {
	const size = 56;
	const strokeWidth = 6;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const maxValue = 60;
	const progress = Math.min(Math.abs(value) / maxValue, 1);
	const offset = circumference * (1 - progress);
	const isPositive = value >= 0;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="-rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className={isPositive ? "text-success" : "text-danger"}
					style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<span className={`text-xs font-medium ${isPositive ? "text-success" : "text-danger"}`}>
					{isPositive ? "↑" : "↓"}
				</span>
			</div>
		</div>
	);
}

function getNextMilestone(current: number): number {
	const milestones = [10, 30, 60, 120, 180, 300, 480, 720];
	for (const m of milestones) {
		if (current < m) return m;
	}
	return 0;
}
