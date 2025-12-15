import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MODULE_CONFIGS } from "@/types/engine.type";
import type { EngineWeeklyReport, EngineWeeklyModuleReport } from "@/lib/api-types";

interface EngineWeeklyCardProps {
	report: EngineWeeklyReport;
}

export function EngineWeeklyCard({ report }: EngineWeeklyCardProps) {
	const { integrated, modules } = report;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">이번 주 거리 통장</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
					<div>
						<p className="text-sm text-muted-foreground">총 적립 거리</p>
						<p className="text-2xl font-bold">
							{integrated.netMin >= 0 ? "+" : ""}
							{integrated.netMin}분
						</p>
					</div>
					{integrated.netMin >= 0 ? (
						<TrendingUp className="size-8 text-green-500" />
					) : (
						<TrendingDown className="size-8 text-red-500" />
					)}
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-lg border p-3">
						<p className="text-xs text-muted-foreground">번 시간</p>
						<p className="text-lg font-semibold text-green-600">+{integrated.earnedMin}분</p>
					</div>
					<div className="rounded-lg border p-3">
						<p className="text-xs text-muted-foreground">차감 시간</p>
						<p className="text-lg font-semibold text-red-500">-{integrated.lostMin}분</p>
					</div>
				</div>

				{modules.length > 0 && (
					<div className="space-y-2 pt-2">
						<p className="text-sm font-medium text-muted-foreground">모듈별 요약</p>
						{modules.map((module) => (
							<ModuleReportRow key={module.moduleType} module={module} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function ModuleReportRow({ module }: { module: EngineWeeklyModuleReport }) {
	const config = MODULE_CONFIGS[module.moduleType];
	const isFocus = module.moduleType === "FOCUS";
	const isCaffeine = module.moduleType === "CAFFEINE";

	return (
		<div className="flex items-center justify-between rounded-lg border p-3">
			<div className="flex items-center gap-2">
				<span className="text-lg">{config?.icon ?? "📊"}</span>
				<div>
					<p className="text-sm font-medium">{config?.label ?? module.moduleType}</p>
					<p className="text-xs text-muted-foreground">
						{isFocus ? (
							<>
								총 {module.focusTotalMin}분 집중
								{module.avgSessionMin && ` · 평균 ${module.avgSessionMin}분/세션`}
							</>
						) : isCaffeine ? (
							<>
								{module.actionCount}잔
								{module.avgIntervalMin && ` · 평균 ${module.avgIntervalMin}분 간격`}
							</>
						) : (
							<>
								{module.actionCount}회
								{module.avgIntervalMin && ` · 평균 ${module.avgIntervalMin}분 간격`}
							</>
						)}
					</p>
				</div>
			</div>
			<div className="text-right">
				<p className={`font-semibold ${module.netMin >= 0 ? "text-green-600" : "text-red-500"}`}>
					{module.netMin >= 0 ? "+" : ""}
					{module.netMin}분
				</p>
			</div>
		</div>
	);
}
