import { useEffect, useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/date";
import { MODULE_CONFIGS, isFocusStatus } from "@/types/engine.type";
import { getStatusA11yLabel } from "@/lib/design-system";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EngineModuleState } from "@/types/engine.type";

interface ModuleCardProps {
	moduleState: EngineModuleState;
	onAction: () => void;
	onUrge: () => void;
}

export function ModuleCard({ moduleState, onAction, onUrge }: ModuleCardProps) {
	const isFocus = isFocusStatus(moduleState.status);

	if (isFocus) {
		return <FocusModuleCard moduleState={moduleState} onAction={onAction} onUrge={onUrge} />;
	}

	return <IntervalModuleCard moduleState={moduleState} onAction={onAction} onUrge={onUrge} />;
}

function IntervalModuleCard({ moduleState, onAction, onUrge }: ModuleCardProps) {
	const prefersReducedMotion = useReducedMotion();
	const config = MODULE_CONFIGS[moduleState.moduleType];
	const actionLabel = config?.actionLabel ?? "기록";

	const [remainingSeconds, setRemainingSeconds] = useState(0);

	useEffect(() => {
		if (moduleState.status !== "COUNTDOWN" || !moduleState.targetTime) {
			setRemainingSeconds(0);
			return;
		}

		const targetTime = new Date(moduleState.targetTime);

		const updateRemaining = () => {
			const now = new Date();
			const diff = Math.max(0, Math.ceil((targetTime.getTime() - now.getTime()) / 1000));
			setRemainingSeconds(diff);
		};

		updateRemaining();
		const interval = setInterval(updateRemaining, 1000);
		return () => clearInterval(interval);
	}, [moduleState.status, moduleState.targetTime]);

	const isCountdown = moduleState.status === "COUNTDOWN";
	const isReady = moduleState.status === "READY";
	// const isNoBaseline = moduleState.status === "NO_BASELINE";
	const isGap = moduleState.status === "GAP_DETECTED";

	const remainingMin = moduleState.remainingMin ?? Math.ceil(remainingSeconds / 60);
	const canCharge = isCountdown && remainingMin > 0;

	const progress = useMemo(() => {
		if (isCountdown && moduleState.targetIntervalMin) {
			const total = moduleState.targetIntervalMin * 60;
			if (total <= 0) return 0;
			return Math.max(0, Math.min(1, 1 - remainingSeconds / total));
		}
		return isReady ? 1 : 0;
	}, [isCountdown, isReady, remainingSeconds, moduleState.targetIntervalMin]);

	const a11yStatus = getStatusA11yLabel(moduleState.status);
	const subtitle = getIntervalSubtitle(moduleState.status, remainingSeconds);

	const net = moduleState.todayNetMin ?? 0;
	const netIsPositive = net >= 0;
	const netTone = net === 0 ? "text-text-secondary" : netIsPositive ? "text-earned" : "text-lost";

	const actionCount = moduleState.todayActionCount ?? 0;
	const dailyGoal = moduleState.dailyGoalCount;
	const countUnit = moduleState.moduleType === "CAFFEINE" ? "잔" : "회";
	const showCountRow = actionCount > 0 || (dailyGoal ?? 0) > 0;

	return (
		<Card
			className={cn(
				"overflow-hidden border-0 rounded-3xl",
				"bg-surface/70 backdrop-blur-xl ring-1 ring-inset ring-white/8",
				"shadow-[0_12px_40px_rgba(0,0,0,0.14)]",
				"transition-all duration-150 hover:bg-surface/80 hover:shadow-[0_14px_55px_rgba(0,0,0,0.18)]",
				isReady && "neon-glow-success",
				isCountdown && "neon-glow-primary",
				isGap && "neon-glow-danger",
			)}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex items-center gap-3">
						<div
							className={cn(
								"flex size-10 shrink-0 items-center justify-center rounded-2xl",
								"ring-1 ring-inset ring-white/10",
								isReady ? "bg-success/12" : isGap ? "bg-warning/12" : "bg-white/6",
							)}
						>
							<span className="text-xl" role="img" aria-hidden="true">
								{config.icon}
							</span>
						</div>

						<div className="min-w-0">
							<p className="truncate font-semibold tracking-tight">{config.label}</p>
							<p
								className="mt-0.5 truncate text-xs leading-snug text-text-tertiary"
								aria-label={a11yStatus.description || a11yStatus.label}
							>
								{subtitle}
							</p>
						</div>
					</div>

					<div className="shrink-0 text-right">
						<p
							className={cn("text-lg font-semibold tabular-nums", netTone)}
							aria-label={`오늘 순거리 ${netIsPositive ? "적립" : "차감"} ${Math.abs(net)}분`}
						>
							{netIsPositive && net !== 0 ? "+" : ""}
							{net}분
						</p>
						<p className="text-xs text-text-tertiary">오늘 순거리</p>
					</div>
				</div>

				{showCountRow ? (
					<div className="mt-3 flex items-center gap-2 text-sm">
						<span className="text-text-tertiary">오늘</span>
						<span className="font-medium tabular-nums">
							{actionCount}
							{countUnit}
						</span>
						{dailyGoal ? (
							<span className="text-text-tertiary tabular-nums">
								/ {dailyGoal}
								{countUnit}
							</span>
						) : null}
					</div>
				) : null}

				{isCountdown ? (
					<div className="mt-4 rounded-2xl bg-white/4 p-3 ring-1 ring-inset ring-white/8">
						<div className="mb-2 flex items-center justify-between gap-3">
							<div className="min-w-0 flex items-center gap-2">
								<Clock className="size-4 text-text-tertiary" aria-hidden="true" />
								<span
									className="truncate text-2xl font-bold tabular-nums"
									aria-label={`남은 시간 ${formatTime(remainingSeconds)}`}
								>
									{formatTime(remainingSeconds)}
								</span>
							</div>
							<span className="shrink-0 text-xs text-text-tertiary tabular-nums">
								목표 {moduleState.targetIntervalMin ?? "—"}분
							</span>
						</div>

						<div
							className="h-1.5 overflow-hidden rounded-full bg-white/8"
							role="progressbar"
							aria-valuenow={Math.round(progress * 100)}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<motion.div
								className="h-full bg-primary"
								initial={prefersReducedMotion ? false : { width: 0 }}
								animate={{ width: `${progress * 100}%` }}
								transition={
									prefersReducedMotion ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }
								}
							/>
						</div>
					</div>
				) : null}

				<IntervalCTA
					status={moduleState.status}
					actionLabel={actionLabel}
					remainingMin={remainingMin}
					canCharge={canCharge}
					onAction={onAction}
					onUrge={onUrge}
					isCountdown={isCountdown}
				/>
			</CardContent>
		</Card>
	);
}

function IntervalCTA({
	status,
	actionLabel,
	remainingMin,
	canCharge,
	onAction,
	onUrge,
	isCountdown,
}: {
	status: string;
	actionLabel: string;
	remainingMin: number;
	canCharge: boolean;
	onAction: () => void;
	onUrge: () => void;
	isCountdown: boolean;
}) {
	if (status === "GAP_DETECTED") {
		return (
			<div className="mt-4">
				<Button className="h-11 w-full gap-2" variant="outline" onClick={onAction}>
					<span>다시 시작</span>
					<ArrowRight className="size-4" />
				</Button>
			</div>
		);
	}

	if (status === "NO_BASELINE") {
		return (
			<div className="mt-4">
				<Button className="h-11 w-full" onClick={onAction}>
					첫 기록 남기기
				</Button>
			</div>
		);
	}

	if (status === "READY") {
		return (
			<div className="mt-4">
				<Button className="h-11 w-full" onClick={onAction}>
					{actionLabel}
				</Button>
			</div>
		);
	}

	if (isCountdown) {
		return (
			<div className="mt-4">
				<div className="flex gap-2">
					<Button variant="default" className="h-11 flex-1" onClick={onUrge}>
						기다려서 적립
					</Button>
					<Button variant="ghost" className="h-11 flex-1 text-text-secondary" onClick={onAction}>
						지금 {actionLabel}
					</Button>
				</div>

				{canCharge ? (
					<p className="mt-2 text-center text-xs text-text-tertiary">
						지금 기록하면{" "}
						<span className="font-medium tabular-nums text-text-secondary">{remainingMin}분</span>{" "}
						차감될 수 있어요
					</p>
				) : null}
			</div>
		);
	}

	return null;
}

function FocusModuleCard({ moduleState, onAction, onUrge }: ModuleCardProps) {
	const prefersReducedMotion = useReducedMotion();
	const config = MODULE_CONFIGS[moduleState.moduleType];

	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [remainingSeconds, setRemainingSeconds] = useState(0);

	const isIdle = moduleState.status === "FOCUS_IDLE";
	const isActive =
		moduleState.status === "FOCUS_RUNNING" || moduleState.status === "FOCUS_COACHING";
	const isCoaching = moduleState.status === "FOCUS_COACHING";

	const session = moduleState.focusSession;
	const defaultSessionMin = moduleState.defaultSessionMin ?? 10;

	useEffect(() => {
		if (!isActive || !session) {
			setElapsedSeconds(0);
			setRemainingSeconds(0);
			return;
		}

		const sessionStartTime = new Date(session.sessionStartTime);
		const totalPlannedMs = (session.plannedMinutes + session.extendedMinutes) * 60 * 1000;

		const updateTimer = () => {
			const now = new Date();
			const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
			const remaining = Math.max(
				0,
				Math.ceil((sessionStartTime.getTime() + totalPlannedMs - now.getTime()) / 1000),
			);
			setElapsedSeconds(elapsed);
			setRemainingSeconds(remaining);
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [isActive, session]);

	const totalFocusMin = moduleState.todayFocusTotalMin ?? 0;

	const net = moduleState.todayNetMin ?? 0;
	const netIsPositive = net >= 0;
	const netTone = net === 0 ? "text-text-secondary" : netIsPositive ? "text-earned" : "text-lost";

	const focusSubtitle = isIdle
		? "집중을 시작해볼까요?"
		: isCoaching
			? "흐트러짐 감지 · 30초 숨 고르기"
			: `${Math.floor(elapsedSeconds / 60)}분째 집중 중`;

	const totalSeconds = Math.max(
		1,
		(session?.plannedMinutes ?? defaultSessionMin) * 60 + (session?.extendedMinutes ?? 0) * 60,
	);
	const focusProgress = Math.min(1, Math.max(0, elapsedSeconds / totalSeconds));

	return (
		<Card
			className={cn(
				"overflow-hidden border-0 rounded-3xl",
				"bg-surface/70 backdrop-blur-xl ring-1 ring-inset ring-white/8",
				"shadow-[0_12px_40px_rgba(0,0,0,0.14)]",
				"transition-all duration-150 hover:bg-surface/80 hover:shadow-[0_14px_55px_rgba(0,0,0,0.18)]",
				isActive && "neon-glow-focus",
				isCoaching && "neon-glow-danger",
			)}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex items-center gap-3">
						<div
							className={cn(
								"flex size-10 shrink-0 items-center justify-center rounded-2xl",
								"ring-1 ring-inset ring-white/10",
								isActive ? "bg-focus/12" : "bg-white/6",
							)}
						>
							<span className="text-xl" role="img" aria-hidden="true">
								{config.icon}
							</span>
						</div>

						<div className="min-w-0">
							<p className="truncate font-semibold tracking-tight">{config.label}</p>
							<p className="mt-0.5 truncate text-xs leading-snug text-text-tertiary">
								{focusSubtitle}
							</p>
						</div>
					</div>

					<div className="shrink-0 text-right">
						<p className={cn("text-lg font-semibold tabular-nums", netTone)}>
							{netIsPositive && net !== 0 ? "+" : ""}
							{net}분
						</p>
						<p className="text-xs text-text-tertiary">오늘 순거리</p>
					</div>
				</div>

				<div className="mt-3 flex items-center gap-2 text-sm">
					<span className="text-text-tertiary">총 집중</span>
					<span className="font-medium tabular-nums">{totalFocusMin}분</span>
				</div>

				{isActive && session ? (
					<div className="mt-4 rounded-2xl bg-white/4 p-3 ring-1 ring-inset ring-white/8">
						<div className="mb-2 flex items-center justify-between gap-3">
							<div className="min-w-0 flex items-baseline gap-2">
								<span
									className="truncate text-2xl font-bold tabular-nums text-focus"
									aria-label={`경과 시간 ${formatTime(elapsedSeconds)}`}
								>
									{formatTime(elapsedSeconds)}
								</span>
								<span className="shrink-0 text-xs text-text-tertiary">경과</span>
							</div>

							<div className="shrink-0 flex items-baseline gap-2">
								<span className="text-lg tabular-nums text-text-secondary">
									{formatTime(remainingSeconds)}
								</span>
								<span className="text-xs text-text-tertiary">남음</span>
							</div>
						</div>

						<div
							className="h-1.5 overflow-hidden rounded-full bg-white/8"
							role="progressbar"
							aria-valuenow={Math.round(focusProgress * 100)}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<motion.div
								className="h-full bg-focus"
								initial={prefersReducedMotion ? false : { width: 0 }}
								animate={{ width: `${focusProgress * 100}%` }}
								transition={
									prefersReducedMotion ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }
								}
							/>
						</div>

						{session.extendedMinutes > 0 ? (
							<p className="mt-1.5 text-xs text-focus tabular-nums">
								+{session.extendedMinutes}분 연장됨
							</p>
						) : null}
					</div>
				) : null}

				<div className="mt-4">
					{isIdle ? (
						<Button className="h-11 w-full" onClick={onAction}>
							{defaultSessionMin}분 집중 시작
						</Button>
					) : isActive ? (
						<div className="flex gap-2">
							<Button variant="outline" className="h-11 flex-1" onClick={onUrge}>
								숨 고르기
							</Button>
							<Button
								variant="ghost"
								className="h-11 flex-1 text-text-secondary"
								onClick={onAction}
							>
								세션 종료
							</Button>
						</div>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}

function getIntervalSubtitle(status: string, remainingSeconds: number): string {
	switch (status) {
		case "NO_BASELINE":
			return "오늘 첫 기록을 남겨보세요";
		case "COUNTDOWN":
			return remainingSeconds > 0
				? `다음 기록까지 ${formatTime(remainingSeconds)}`
				: "이제 기록 가능해요";
		case "READY":
			return "지금 기록 가능해요";
		case "GAP_DETECTED":
			return "오랜만이에요 · 다시 시작해요";
		case "SETUP_REQUIRED":
			return "설정이 필요해요";
		default:
			return "";
	}
}
