import { motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { NeonSurface, NeonTile, HaloGauge } from "@/components/primitives";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { ArrowRight, Lightbulb, Target, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { MODULE_CONFIGS } from "@/types/engine.type";
import { cn } from "@/lib/utils";
import { formatWeekRange } from "@/lib/date";
import { FORMULAS, TERMS, formatMinutesKo } from "@/lib/lexicon";
import type { ReportData } from "@/types/report.type";
import type { EngineWeeklyReport, EngineWeeklyModuleReport } from "@/lib/api-types";

interface SimpleReportContentProps {
	data: ReportData;
	engineReport?: EngineWeeklyReport;
}

export function SimpleReportContent({ data, engineReport }: SimpleReportContentProps) {
	const navigate = useNavigate();
	const prefersReducedMotion = useReducedMotion();

	const streak = data.streakDays;

	const weeklyNet = engineReport?.integrated.netMin ?? 0;
	const weeklyEarned = engineReport?.integrated.earnedMin ?? 0;
	const weeklyLost = engineReport?.integrated.lostMin ?? 0;

	const insight = generateTopInsight(data, engineReport);
	const nextAction = generateNextAction(data, engineReport);

	return (
		<motion.div
			variants={prefersReducedMotion ? undefined : staggerContainer}
			initial="hidden"
			animate="visible"
			className="relative flex flex-1 flex-col pb-10 overflow-hidden"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/7 blur-3xl"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-52 left-6 h-56 w-56 rounded-full bg-focus/7 blur-3xl"
			/>

			<motion.header
				variants={prefersReducedMotion ? undefined : staggerItem}
				className="px-6 pt-6"
			>
				<p className="text-xs text-text-tertiary">{formatWeekRange()}</p>
				<h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
					{getWeeklySummaryText(weeklyNet, streak)}
				</h1>
				<p className="mt-2 text-xs text-text-tertiary">{FORMULAS.balance}</p>
			</motion.header>

			<motion.section
				variants={prefersReducedMotion ? undefined : staggerItem}
				className="flex flex-col items-center px-6 py-7"
			>
				<WeeklyHaloHero netMin={weeklyNet} />
				<div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3">
					<NeonTile variant="elevated" glow={weeklyEarned > 0 ? "success" : "none"} size="sm">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<div className="flex size-9 items-center justify-center rounded-xl bg-success/15">
									<TrendingUp className="size-5 text-success" aria-hidden="true" />
								</div>
								<p className="text-xs text-text-tertiary">{TERMS.credit}</p>
							</div>
							<p
								className={cn(
									"text-lg font-semibold tabular-nums",
									weeklyEarned > 0 ? "text-success" : "text-text-secondary",
								)}
							>
								{formatMinutesKo(weeklyEarned)}
							</p>
						</div>
					</NeonTile>

					<NeonTile variant="elevated" glow={weeklyLost > 0 ? "danger" : "none"} size="sm">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<div className="flex size-9 items-center justify-center rounded-xl bg-danger/15">
									<TrendingDown className="size-5 text-danger" aria-hidden="true" />
								</div>
								<p className="text-xs text-text-tertiary">{TERMS.debit}</p>
							</div>
							<p
								className={cn(
									"text-lg font-semibold tabular-nums",
									weeklyLost > 0 ? "text-danger" : "text-text-secondary",
								)}
							>
								{formatMinutesKo(weeklyLost)}
							</p>
						</div>
					</NeonTile>

					{streak > 0 ? (
						<NeonTile variant="elevated" glow="warning" size="sm" className="col-span-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex size-9 items-center justify-center rounded-xl bg-celebration/15">
										<Zap className="size-5 text-celebration" aria-hidden="true" />
									</div>
									<div>
										<p className="text-xs text-text-tertiary">연속 {TERMS.depositAction}</p>
										<p className="text-xs text-text-tertiary">하루 10분 이상 적립</p>
									</div>
								</div>
								<p className="text-xl font-semibold tabular-nums">{streak}일</p>
							</div>
						</NeonTile>
					) : null}
				</div>
			</motion.section>

			<div className="flex flex-col gap-4 px-6">
				{engineReport?.modules?.length ? (
					<motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
						<ModuleBreakdownSection modules={engineReport.modules} />
					</motion.div>
				) : null}

				<motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
					<InsightSection insight={insight} />
				</motion.div>

				<motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
					<NextActionSection action={nextAction} onAction={() => navigate("/")} />
				</motion.div>
			</div>
		</motion.div>
	);
}

function WeeklyHaloHero({ netMin }: { netMin: number }) {
	const weeklyGoal = 60;

	const caption =
		netMin >= weeklyGoal
			? `목표 ${weeklyGoal}분 달성`
			: netMin > 0
				? `목표까지 ${formatMinutesKo(weeklyGoal - netMin)}`
				: netMin === 0
					? "이번 주 첫 기록을 만들어보세요"
					: "이번 주는 차감이 조금 더 컸어요";

	return (
		<div className="flex w-full max-w-md flex-col items-center">
			<HaloGauge
				value={netMin}
				maxValue={weeklyGoal}
				size={200}
				strokeWidth={12}
				label={`이번 주 ${TERMS.balance}`}
				animated
			/>
			<p className="mt-3 text-xs text-text-tertiary">{caption}</p>
		</div>
	);
}

function ModuleBreakdownSection({ modules }: { modules: EngineWeeklyModuleReport[] }) {
	const top = modules
		.filter((m) => m.netMin !== 0 || m.actionCount !== 0 || m.focusTotalMin !== 0)
		.sort((a, b) => Math.abs(b.netMin) - Math.abs(a.netMin))
		.slice(0, 4);

	if (top.length === 0) return null;

	return (
		<NeonSurface variant="solid" className="p-4">
			<p className="mb-3 text-sm font-medium text-text-secondary">모듈별 요약</p>
			<div className="space-y-2">
				{top.map((m) => (
					<ModuleRow key={m.moduleType} module={m} />
				))}
			</div>
		</NeonSurface>
	);
}

function ModuleRow({ module }: { module: EngineWeeklyModuleReport }) {
	const config = MODULE_CONFIGS[module.moduleType];
	const isPositive = module.netMin >= 0;

	return (
		<NeonSurface variant="elevated" className="flex items-center justify-between p-3">
			<div className="flex min-w-0 items-center gap-2.5">
				<span className="text-lg">{config?.icon ?? "📊"}</span>
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{config?.label ?? module.moduleType}</p>
					<p className="truncate text-xs text-text-tertiary">
						{module.moduleType === "FOCUS"
							? `총 ${formatMinutesKo(module.focusTotalMin)}`
							: `${module.actionCount}${module.moduleType === "CAFFEINE" ? "잔" : "회"}`}
						{module.avgIntervalMin ? ` · 평균 ${module.avgIntervalMin}분 간격` : ""}
					</p>
				</div>
			</div>

			<div className="shrink-0 text-right">
				<p
					className={cn(
						"text-sm font-semibold tabular-nums",
						isPositive ? "text-earned" : "text-lost",
					)}
				>
					{isPositive ? "+" : ""}
					{module.netMin}분
				</p>
				<p className="text-[11px] text-text-tertiary">{TERMS.balance} 변화</p>
			</div>
		</NeonSurface>
	);
}

function InsightSection({ insight }: { insight: string }) {
	return (
		<NeonSurface variant="solid" className="p-4">
			<div className="flex items-start gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
					<Lightbulb className="size-4.5 text-primary" aria-hidden="true" />
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium text-text-secondary">이번 주 패턴</p>
					<p className="mt-1 text-sm leading-relaxed text-foreground">{insight}</p>
				</div>
			</div>
		</NeonSurface>
	);
}

function NextActionSection({
	action,
	onAction,
}: {
	action: { title: string; description: string };
	onAction: () => void;
}) {
	return (
		<NeonSurface variant="neon" glow="none" className="p-4">
			<div className="flex items-start gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-success/20">
					<Target className="size-4.5 text-success" aria-hidden="true" />
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium text-success">다음 도전</p>
					<p className="mt-0.5 text-sm font-medium text-foreground">{action.title}</p>
					<p className="mt-0.5 text-xs text-text-tertiary">{action.description}</p>
				</div>
			</div>

			<Button className="mt-4 h-11 w-full gap-2" onClick={onAction}>
				<span>오늘로 돌아가기</span>
				<ArrowRight className="size-4" aria-hidden="true" />
			</Button>
		</NeonSurface>
	);
}

function getWeeklySummaryText(netMin: number, streak: number): string {
	if (netMin >= 60)
		return streak > 0
			? `이번 주 잔액 +${netMin}분 · 연속 ${streak}일`
			: `이번 주 잔액 +${netMin}분`;
	if (netMin > 0) return `이번 주 잔액 +${netMin}분 · 흐름이 좋아요`;
	if (netMin === 0)
		return streak > 0
			? `연속 ${streak}일 · 이번 주는 변동이 적었어요`
			: "이번 주는 아직 변동이 없어요";
	return `이번 주 잔액 ${netMin}분 · 다음 주엔 작은 적립부터`;
}

function generateTopInsight(data: ReportData, engineReport?: EngineWeeklyReport): string {
	if (data.peakHours.length > 0) {
		const peakHour = data.peakHours[0];
		const hourText =
			peakHour.hour < 12
				? `오전 ${peakHour.hour === 0 ? 12 : peakHour.hour}시`
				: `오후 ${peakHour.hour === 12 ? 12 : peakHour.hour - 12}시`;
		return `${hourText} 전후가 가장 흔들리는 시간대예요. 그때는 ‘${TERMS.depositAction} 3분’부터 선택해보세요.`;
	}

	if (engineReport?.modules?.length) {
		const best = engineReport.modules.reduce((a, b) => (a.netMin > b.netMin ? a : b));
		if (best.netMin > 0) {
			const config = MODULE_CONFIGS[best.moduleType];
			return `${config?.label ?? best.moduleType}에서 가장 좋은 흐름이었어요. 다음 주도 이 패턴을 유지해보세요.`;
		}
	}

	return "데이터가 더 쌓이면 더 정확한 패턴을 알려드릴게요.";
}

function generateNextAction(data: ReportData, engineReport?: EngineWeeklyReport) {
	if (data.peakHours.length > 0) {
		const peakHour = data.peakHours[0];
		const hourText =
			peakHour.hour < 12
				? `오전 ${peakHour.hour === 0 ? 12 : peakHour.hour}시`
				: `오후 ${peakHour.hour === 12 ? 12 : peakHour.hour - 12}시`;

		return {
			title: `${hourText}에 3분 ${TERMS.depositAction}`,
			description: "가장 흔들리는 시간대에 작은 적립부터 만들어보세요",
		};
	}

	if (engineReport?.modules?.length) {
		const worst = engineReport.modules.reduce((a, b) => (a.netMin < b.netMin ? a : b));
		if (worst.netMin < 0) {
			const config = MODULE_CONFIGS[worst.moduleType];
			return {
				title: `${config?.label ?? worst.moduleType}에서 1분 ${TERMS.depositAction}`,
				description: "가장 약한 지점에서 ‘작게’ 성공을 만들어보세요",
			};
		}
	}

	return {
		title: `오늘 1분 ${TERMS.depositAction}`,
		description: "1분만 적립해도 흐름이 바뀌기 시작해요",
	};
}
