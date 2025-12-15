import { motion, useReducedMotion } from "motion/react";
import { NeonTile } from "@/components/primitives";
import { Target, TrendingUp, TrendingDown, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EngineIntegratedSummary } from "@/types/engine.type";

interface BentoSummaryProps {
	integrated: EngineIntegratedSummary;
	activeModuleCount: number;
	className?: string;
}

function formatMinutesKo(min: number): string {
	const m = Math.max(0, Math.floor(min));
	if (m >= 60) {
		const h = Math.floor(m / 60);
		const r = m % 60;
		return r === 0 ? `${h}시간` : `${h}시간 ${r}분`;
	}
	return `${m}분`;
}

export function BentoSummary({ integrated, activeModuleCount, className }: BentoSummaryProps) {
	const prefersReducedMotion = useReducedMotion();

	const earnedZero = integrated.earnedMin <= 0;
	const lostZero = integrated.lostMin <= 0;

	const netForMilestone = Math.max(0, integrated.netMin);
	const nextMilestone = getNextMilestone(netForMilestone);
	const prevMilestone = getPreviousMilestone(nextMilestone);
	const remainingToMilestone = nextMilestone > 0 ? Math.max(0, nextMilestone - netForMilestone) : 0;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<motion.div
			variants={prefersReducedMotion ? undefined : containerVariants}
			initial="hidden"
			animate="visible"
			className={cn("grid grid-cols-2 gap-3", className)}
		>
			<motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
				<NeonTile
					variant="elevated"
					glow={earnedZero ? "none" : "success"}
					size="sm"
					className="h-full"
				>
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"flex size-9 items-center justify-center rounded-xl",
								earnedZero ? "bg-white/6" : "bg-success/15",
							)}
						>
							<TrendingUp
								className={cn("size-5", earnedZero ? "text-text-tertiary" : "text-success")}
								aria-hidden="true"
							/>
						</div>
						<div className="min-w-0">
							<p className="text-xs text-text-tertiary">적립</p>
							<p
								className={cn(
									"text-lg font-semibold tabular-nums tracking-tight leading-tight whitespace-nowrap",
									earnedZero ? "text-text-secondary" : "text-success",
								)}
							>
								{formatMinutesKo(integrated.earnedMin)}
							</p>
						</div>
					</div>
				</NeonTile>
			</motion.div>
			<motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
				<NeonTile
					variant="elevated"
					glow={lostZero ? "none" : "danger"}
					size="sm"
					className="h-full"
				>
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"flex size-9 items-center justify-center rounded-xl",
								lostZero ? "bg-white/6" : "bg-danger/15",
							)}
						>
							<TrendingDown
								className={cn("size-5", lostZero ? "text-text-tertiary" : "text-danger")}
								aria-hidden="true"
							/>
						</div>
						<div className="min-w-0">
							<p className="text-xs text-text-tertiary">차감</p>
							<p
								className={cn(
									"text-lg font-semibold tabular-nums tracking-tight leading-tight whitespace-nowrap",
									lostZero ? "text-text-secondary" : "text-danger",
								)}
							>
								{formatMinutesKo(integrated.lostMin)}
							</p>
						</div>
					</div>
				</NeonTile>
			</motion.div>
			<motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
				<NeonTile variant="elevated" size="sm" className="h-full">
					<div className="flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
							<Target className="size-5 text-primary" aria-hidden="true" />
						</div>
						<div className="min-w-0">
							<p className="text-xs text-text-tertiary">활성 모듈</p>
							<p className="text-lg font-semibold tabular-nums tracking-tight leading-tight whitespace-nowrap">
								{activeModuleCount}
								<span className="ml-1 text-sm font-normal text-text-tertiary">개</span>
							</p>
						</div>
					</div>
				</NeonTile>
			</motion.div>
			<motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
				<NeonTile
					variant="elevated"
					glow={netForMilestone > 0 ? "primary" : "none"}
					size="sm"
					className="h-full"
				>
					<div className="flex h-full flex-col justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
								<Flag className="size-5 text-primary" aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<p className="text-xs text-text-tertiary">다음 목표</p>
								<p className="text-lg font-semibold tabular-nums tracking-tight leading-tight whitespace-nowrap">
									{nextMilestone > 0 ? formatMinutesKo(nextMilestone) : "—"}
								</p>
							</div>
						</div>
						{nextMilestone > 0 ? (
							<div>
								<p className="text-xs text-text-tertiary whitespace-nowrap">
									<span className="font-medium tabular-nums text-text-secondary">
										{formatMinutesKo(remainingToMilestone)}
									</span>{" "}
									남음
								</p>
								<MilestoneProgress
									current={netForMilestone}
									previous={prevMilestone}
									target={nextMilestone}
								/>
							</div>
						) : null}
					</div>
				</NeonTile>
			</motion.div>
		</motion.div>
	);
}

function MilestoneProgress({
	current,
	previous,
	target,
}: {
	current: number;
	previous: number;
	target: number;
}) {
	if (target <= 0) return null;

	const range = Math.max(1, target - previous);
	const progress = Math.max(0, Math.min(1, (current - previous) / range));

	return (
		<div
			className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/50 dark:bg-white/10"
			role="progressbar"
			aria-label="다음 목표 진행률"
			aria-valuenow={Math.round(progress * 100)}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<div
				className="h-full bg-primary transition-all duration-500"
				style={{ width: `${progress * 100}%` }}
			/>
		</div>
	);
}

function getNextMilestone(current: number): number {
	const milestones = [10, 30, 60, 120, 180, 300, 480, 720];
	for (const m of milestones) if (current < m) return m;
	return 0;
}

function getPreviousMilestone(current: number): number {
	const milestones = [0, 10, 30, 60, 120, 180, 300, 480, 720];
	for (let i = milestones.length - 1; i >= 0; i--)
		if (milestones[i] < current) return milestones[i];
	return 0;
}
