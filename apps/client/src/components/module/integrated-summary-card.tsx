import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import type { EngineIntegratedSummary } from "@/types/engine.type";

interface IntegratedSummaryCardProps {
	integrated: EngineIntegratedSummary;
}

export function IntegratedSummaryCard({ integrated }: IntegratedSummaryCardProps) {
	return (
		<Card>
			<CardContent className="grid grid-cols-3 gap-4 py-4">
				<div className="flex flex-col items-center gap-1">
					<TrendingUp className="size-5 text-green-500" />
					<p className="text-2xl font-bold text-green-500">
						+{integrated.earnedMin}
						<span className="text-sm font-normal">분</span>
					</p>
					<p className="text-xs text-muted-foreground">벌어낸</p>
				</div>
				<div className="flex flex-col items-center gap-1">
					<TrendingDown className="size-5 text-red-400" />
					<p className="text-2xl font-bold text-red-400">
						-{integrated.lostMin}
						<span className="text-sm font-normal">분</span>
					</p>
					<p className="text-xs text-muted-foreground">잃은</p>
				</div>
				<div className="flex flex-col items-center gap-1">
					<Target className="size-5 text-primary" />
					<p className="text-2xl font-bold text-primary">
						{integrated.netMin}
						<span className="text-sm font-normal">분</span>
					</p>
					<p className="text-xs text-muted-foreground">순거리</p>
				</div>
			</CardContent>
		</Card>
	);
}
