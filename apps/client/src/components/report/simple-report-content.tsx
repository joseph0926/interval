import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem, celebration } from "@/lib/motion";
import { TrendingUp, TrendingDown, Zap, ArrowRight, Target, Lightbulb } from "lucide-react";
import { MODULE_CONFIGS } from "@/types/engine.type";
import type { ReportData } from "@/types/report.type";
import type { EngineWeeklyReport } from "@/lib/api-types";

interface SimpleReportContentProps {
	data: ReportData;
	engineReport?: EngineWeeklyReport;
}

export function SimpleReportContent({ data, engineReport }: SimpleReportContentProps) {
	const navigate = useNavigate();
	const weeklyNet = engineReport?.integrated.netMin ?? 0;
	const netIsPositive = weeklyNet >= 0;
	const streak = data.streakDays;
	const insight = generateTopInsight(data, engineReport);
	const nextAction = generateNextAction(data, engineReport);

	return (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="flex flex-1 flex-col"
		>
			<motion.div variants={staggerItem} className="px-6 pt-12">
				<p className="text-sm text-text-tertiary">이번 주 리포트</p>
				<h1 className="mt-1 text-xl font-semibold">{getWeeklySummaryText(weeklyNet, streak)}</h1>
			</motion.div>

			<div className="flex flex-col gap-4 px-6 py-6">
				<motion.div variants={netIsPositive ? celebration : staggerItem}>
					<WeeklyHighlightCard
						netMin={weeklyNet}
						earnedMin={engineReport?.integrated.earnedMin ?? 0}
						lostMin={engineReport?.integrated.lostMin ?? 0}
						streak={streak}
					/>
				</motion.div>

				{engineReport && engineReport.modules.length > 0 && (
					<motion.div variants={staggerItem}>
						<ModuleBreakdownCard modules={engineReport.modules} />
					</motion.div>
				)}

				<motion.div variants={staggerItem}>
					<InsightCard insight={insight} />
				</motion.div>

				<motion.div variants={staggerItem}>
					<NextActionCard action={nextAction} onAction={() => navigate("/")} />
				</motion.div>
			</div>
		</motion.div>
	);
}

function WeeklyHighlightCard({
	netMin,
	earnedMin,
	lostMin,
	streak,
}: {
	netMin: number;
	earnedMin: number;
	lostMin: number;
	streak: number;
}) {
	const isPositive = netMin >= 0;

	return (
		<Card className="border-0 bg-surface p-5 shadow-sm">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-text-tertiary">이번 주 순거리</p>
					<div className="mt-1 flex items-baseline gap-1">
						<span
							className={`text-4xl font-bold tabular-nums ${isPositive ? "text-earned" : "text-lost"}`}
						>
							{isPositive ? "+" : ""}
							{netMin}
						</span>
						<span className="text-lg text-text-secondary">분</span>
					</div>
				</div>
				<div
					className={`flex size-14 items-center justify-center rounded-full ${
						isPositive ? "bg-success-muted" : "bg-danger-muted"
					}`}
				>
					{isPositive ? (
						<TrendingUp className="size-7 text-success" />
					) : (
						<TrendingDown className="size-7 text-danger" />
					)}
				</div>
			</div>

			<div className="mt-4 grid grid-cols-3 gap-3">
				<div className="rounded-lg bg-surface-elevated p-2.5 text-center">
					<p className="text-lg font-semibold tabular-nums text-earned">+{earnedMin}</p>
					<p className="text-[11px] text-text-tertiary">벌어낸</p>
				</div>
				<div className="rounded-lg bg-surface-elevated p-2.5 text-center">
					<p className="text-lg font-semibold tabular-nums text-lost">-{lostMin}</p>
					<p className="text-[11px] text-text-tertiary">잃은</p>
				</div>
				{streak > 0 && (
					<div className="flex items-center justify-center gap-1.5 rounded-lg bg-celebration/10 p-2.5">
						<Zap className="size-4 text-celebration" />
						<span className="text-sm font-semibold">{streak}일</span>
					</div>
				)}
			</div>
		</Card>
	);
}

function ModuleBreakdownCard({ modules }: { modules: EngineWeeklyReport["modules"] }) {
	const topModules = modules
		.filter((m) => m.netMin !== 0)
		.sort((a, b) => Math.abs(b.netMin) - Math.abs(a.netMin))
		.slice(0, 3);

	if (topModules.length === 0) return null;

	return (
		<Card className="border-0 bg-surface p-4 shadow-sm">
			<p className="mb-3 text-sm font-medium text-text-secondary">모듈별 요약</p>
			<div className="space-y-2">
				{topModules.map((module) => {
					const config = MODULE_CONFIGS[module.moduleType];
					const isPositive = module.netMin >= 0;
					return (
						<div
							key={module.moduleType}
							className="flex items-center justify-between rounded-lg bg-surface-elevated p-3"
						>
							<div className="flex items-center gap-2.5">
								<span className="text-lg">{config?.icon ?? "📊"}</span>
								<span className="text-sm font-medium">{config?.label ?? module.moduleType}</span>
							</div>
							<span
								className={`font-semibold tabular-nums ${isPositive ? "text-earned" : "text-lost"}`}
							>
								{isPositive ? "+" : ""}
								{module.netMin}분
							</span>
						</div>
					);
				})}
			</div>
		</Card>
	);
}

function InsightCard({ insight }: { insight: string }) {
	return (
		<Card className="border-0 bg-surface p-4 shadow-sm">
			<div className="flex items-start gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
					<Lightbulb className="size-4.5 text-primary" />
				</div>
				<div>
					<p className="text-sm font-medium text-text-secondary">이번 주 패턴</p>
					<p className="mt-1 text-sm text-foreground">{insight}</p>
				</div>
			</div>
		</Card>
	);
}

function NextActionCard({
	action,
	onAction,
}: {
	action: { title: string; description: string };
	onAction: () => void;
}) {
	return (
		<Card className="border-0 bg-primary/5 p-4 shadow-sm">
			<div className="flex items-start gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
					<Target className="size-4.5 text-primary" />
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium text-primary">다음 행동</p>
					<p className="mt-0.5 text-sm text-foreground">{action.title}</p>
					<p className="mt-0.5 text-xs text-text-tertiary">{action.description}</p>
				</div>
			</div>
			<Button className="mt-4 h-11 w-full gap-2" onClick={onAction}>
				<span>홈으로 가기</span>
				<ArrowRight className="size-4" />
			</Button>
		</Card>
	);
}

function getWeeklySummaryText(netMin: number, streak: number): string {
	if (netMin >= 60) {
		return streak > 3 ? `${streak}일 연속! 1시간 이상 벌었어요` : "1시간 넘게 거리를 벌었어요";
	}
	if (netMin >= 30) {
		return "30분 이상 거리를 만들었어요";
	}
	if (netMin > 0) {
		return "조금씩 거리를 만들어가고 있어요";
	}
	if (netMin === 0) {
		return "이번 주 기록을 시작해보세요";
	}
	return "다음 주엔 더 잘할 수 있어요";
}

function generateTopInsight(data: ReportData, engineReport?: EngineWeeklyReport): string {
	if (data.peakHours.length > 0) {
		const peakHour = data.peakHours[0];
		const hourText =
			peakHour.hour < 12
				? `오전 ${peakHour.hour === 0 ? 12 : peakHour.hour}시`
				: `오후 ${peakHour.hour === 12 ? 12 : peakHour.hour - 12}시`;
		return `${hourText}쯤이 가장 충동이 강한 시간대예요. 이 시간에 미루기를 시도해보세요.`;
	}

	if (engineReport && engineReport.modules.length > 0) {
		const bestModule = engineReport.modules.reduce((a, b) => (a.netMin > b.netMin ? a : b));
		if (bestModule.netMin > 0) {
			const config = MODULE_CONFIGS[bestModule.moduleType];
			return `${config?.label ?? bestModule.moduleType}에서 가장 많은 거리를 벌었어요.`;
		}
	}

	if (data.weeklySummary.averageInterval && data.weeklySummary.previousWeekAverageInterval) {
		const diff =
			data.weeklySummary.averageInterval - data.weeklySummary.previousWeekAverageInterval;
		if (diff > 0) {
			return `지난주보다 평균 간격이 ${diff}분 늘었어요.`;
		}
	}

	return "데이터가 쌓이면 더 정확한 패턴을 알려드릴게요.";
}

function generateNextAction(
	data: ReportData,
	engineReport?: EngineWeeklyReport,
): { title: string; description: string } {
	if (data.peakHours.length > 0) {
		const peakHour = data.peakHours[0];
		const hourText =
			peakHour.hour < 12
				? `오전 ${peakHour.hour === 0 ? 12 : peakHour.hour}시`
				: `오후 ${peakHour.hour === 12 ? 12 : peakHour.hour - 12}시`;
		return {
			title: `${hourText}에 3분 미루기 도전`,
			description: "가장 충동이 강한 시간에 작은 성공을 만들어보세요",
		};
	}

	if (engineReport) {
		const worstModule = engineReport.modules.reduce(
			(a, b) => (a.netMin < b.netMin ? a : b),
			engineReport.modules[0],
		);
		if (worstModule && worstModule.netMin < 0) {
			const config = MODULE_CONFIGS[worstModule.moduleType];
			return {
				title: `${config?.label ?? worstModule.moduleType} 1분 미루기`,
				description: "작은 성공부터 시작해보세요",
			};
		}
	}

	return {
		title: "오늘 첫 미루기 도전",
		description: "1분만 미뤄봐도 거리가 생겨요",
	};
}
