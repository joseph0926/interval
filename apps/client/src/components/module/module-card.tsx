import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/date";
import { MODULE_CONFIGS, isFocusStatus } from "@/types/engine.type";
import { getStatusA11yLabel } from "@/lib/design-system";
import { Clock, ArrowRight } from "lucide-react";
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
	const config = MODULE_CONFIGS[moduleState.moduleType];
	const [remainingSeconds, setRemainingSeconds] = useState(
		moduleState.remainingMin ? moduleState.remainingMin * 60 : 0,
	);

	useEffect(() => {
		if (moduleState.status !== "COUNTDOWN" || !moduleState.targetTime) return;

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
	const isNoBaseline = moduleState.status === "NO_BASELINE";
	const isGap = moduleState.status === "GAP_DETECTED";

	const progress = useMemo(() => {
		if (isCountdown && moduleState.targetIntervalMin) {
			return Math.min(1, 1 - remainingSeconds / (moduleState.targetIntervalMin * 60));
		}
		return isReady ? 1 : 0;
	}, [isCountdown, isReady, remainingSeconds, moduleState.targetIntervalMin]);

	const isCaffeine = moduleState.moduleType === "CAFFEINE";
	const actionCount = moduleState.todayActionCount ?? 0;
	const dailyGoal = moduleState.dailyGoalCount;
	const a11yStatus = getStatusA11yLabel(moduleState.status);

	const netIsPositive = (moduleState.todayNetMin ?? 0) >= 0;

	return (
		<Card
			className={`overflow-hidden border-0 bg-surface shadow-sm transition-shadow hover:shadow-md ${
				isReady ? "ring-1 ring-success/30" : ""
			}`}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div
							className={`flex size-10 items-center justify-center rounded-xl ${
								isReady ? "bg-success-muted" : isGap ? "bg-warning-muted" : "bg-muted"
							}`}
						>
							<span className="text-xl" role="img" aria-hidden="true">
								{config.icon}
							</span>
						</div>
						<div>
							<p className="font-medium">{config.label}</p>
							<p className="text-sm text-text-tertiary" aria-label={a11yStatus.description}>
								{getStatusText(moduleState, remainingSeconds)}
							</p>
						</div>
					</div>
					<div className="text-right">
						<p
							className={`text-lg font-bold tabular-nums ${netIsPositive ? "text-earned" : "text-lost"}`}
							aria-label={`오늘 ${netIsPositive ? "벌어낸" : "잃은"} 거리 ${Math.abs(moduleState.todayNetMin ?? 0)}분`}
						>
							{netIsPositive ? "+" : ""}
							{moduleState.todayNetMin}분
						</p>
						<p className="text-xs text-text-tertiary">오늘 거리</p>
					</div>
				</div>

				{isCaffeine && (
					<div className="mt-3 flex items-center gap-2 text-sm">
						<span className="text-text-tertiary">오늘</span>
						<span className="font-medium">{actionCount}잔</span>
						{dailyGoal && <span className="text-text-tertiary">/ {dailyGoal}잔</span>}
					</div>
				)}

				{isCountdown && (
					<div className="mt-4">
						<div className="mb-2 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Clock className="size-4 text-text-tertiary" aria-hidden="true" />
								<span
									className="text-2xl font-bold tabular-nums"
									aria-label={`남은 시간 ${formatTime(remainingSeconds)}`}
								>
									{formatTime(remainingSeconds)}
								</span>
							</div>
							<span className="text-sm text-text-tertiary">
								목표 {moduleState.targetIntervalMin}분
							</span>
						</div>
						<div
							className="h-1.5 overflow-hidden rounded-full bg-muted"
							role="progressbar"
							aria-valuenow={Math.round(progress * 100)}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<motion.div
								className="h-full bg-primary"
								initial={{ width: 0 }}
								animate={{ width: `${progress * 100}%` }}
								transition={{ duration: 0.5, ease: "easeOut" }}
							/>
						</div>
					</div>
				)}

				<ModuleCardCTA
					status={moduleState.status}
					onAction={onAction}
					onUrge={onUrge}
					isReady={isReady}
					isNoBaseline={isNoBaseline}
					isGap={isGap}
					isCountdown={isCountdown}
				/>
			</CardContent>
		</Card>
	);
}

function ModuleCardCTA({
	status,
	onAction,
	onUrge,
	isReady,
	isNoBaseline,
	isGap,
	isCountdown,
}: {
	status: string;
	onAction: () => void;
	onUrge: () => void;
	isReady: boolean;
	isNoBaseline: boolean;
	isGap: boolean;
	isCountdown: boolean;
}) {
	if (isGap) {
		return (
			<div className="mt-4">
				<Button className="h-11 w-full gap-2" variant="outline" onClick={onAction}>
					<span>복귀하기</span>
					<ArrowRight className="size-4" />
				</Button>
			</div>
		);
	}

	if (isReady) {
		return (
			<div className="mt-4">
				<Button className="h-11 w-full" onClick={onAction}>
					기록하기
				</Button>
			</div>
		);
	}

	if (isNoBaseline) {
		return (
			<div className="mt-4">
				<Button className="h-11 w-full" onClick={onAction}>
					첫 기록하기
				</Button>
			</div>
		);
	}

	if (isCountdown) {
		return (
			<div className="mt-4 flex gap-2">
				<Button variant="default" className="h-11 flex-1" onClick={onUrge}>
					미루기
				</Button>
				<Button variant="ghost" className="h-11 flex-1 text-text-secondary" onClick={onAction}>
					기록
				</Button>
			</div>
		);
	}

	return null;
}

function FocusModuleCard({ moduleState, onAction, onUrge }: ModuleCardProps) {
	const config = MODULE_CONFIGS[moduleState.moduleType];
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [remainingSeconds, setRemainingSeconds] = useState(0);

	const isIdle = moduleState.status === "FOCUS_IDLE";
	const isRunning = moduleState.status === "FOCUS_RUNNING";
	const session = moduleState.focusSession;
	const defaultSessionMin = moduleState.defaultSessionMin ?? 10;

	useEffect(() => {
		if (!isRunning || !session) return;

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
	}, [isRunning, session]);

	const totalFocusMin = moduleState.todayFocusTotalMin ?? 0;
	const netIsPositive = (moduleState.todayNetMin ?? 0) >= 0;

	return (
		<Card
			className={`overflow-hidden border-0 bg-surface shadow-sm transition-shadow hover:shadow-md ${
				isRunning ? "ring-1 ring-focus/30" : ""
			}`}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div
							className={`flex size-10 items-center justify-center rounded-xl ${
								isRunning ? "bg-focus/15" : "bg-muted"
							}`}
						>
							<span className="text-xl" role="img" aria-hidden="true">
								{config.icon}
							</span>
						</div>
						<div>
							<p className="font-medium">{config.label}</p>
							<p className="text-sm text-text-tertiary">
								{isIdle && "세션을 시작해보세요"}
								{isRunning && `${Math.floor(elapsedSeconds / 60)}분째 집중 중`}
							</p>
						</div>
					</div>
					<div className="text-right">
						<p
							className={`text-lg font-bold tabular-nums ${netIsPositive ? "text-earned" : "text-lost"}`}
						>
							{netIsPositive ? "+" : ""}
							{moduleState.todayNetMin}분
						</p>
						<p className="text-xs text-text-tertiary">오늘 거리</p>
					</div>
				</div>

				<div className="mt-3 flex items-center gap-2 text-sm">
					<span className="text-text-tertiary">총 집중</span>
					<span className="font-medium">{totalFocusMin}분</span>
				</div>

				{isRunning && session && (
					<div className="mt-4">
						<div className="mb-2 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span
									className="text-2xl font-bold tabular-nums text-focus"
									aria-label={`경과 시간 ${formatTime(elapsedSeconds)}`}
								>
									{formatTime(elapsedSeconds)}
								</span>
								<span className="text-xs text-text-tertiary">경과</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-lg tabular-nums text-text-secondary">
									{formatTime(remainingSeconds)}
								</span>
								<span className="text-xs text-text-tertiary">남음</span>
							</div>
						</div>
						<div
							className="h-1.5 overflow-hidden rounded-full bg-muted"
							role="progressbar"
							aria-valuenow={Math.round(
								(elapsedSeconds / ((session.plannedMinutes + session.extendedMinutes) * 60)) * 100,
							)}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<motion.div
								className="h-full bg-focus"
								initial={{ width: 0 }}
								animate={{
									width: `${Math.min(100, (elapsedSeconds / ((session.plannedMinutes + session.extendedMinutes) * 60)) * 100)}%`,
								}}
								transition={{ duration: 0.5, ease: "easeOut" }}
							/>
						</div>
						{session.extendedMinutes > 0 && (
							<p className="mt-1.5 text-xs text-focus">+{session.extendedMinutes}분 연장됨</p>
						)}
					</div>
				)}

				<div className="mt-4">
					{isIdle ? (
						<Button className="h-11 w-full" onClick={onAction}>
							{defaultSessionMin}분 집중 시작
						</Button>
					) : isRunning ? (
						<div className="flex gap-2">
							<Button variant="outline" className="h-11 flex-1" onClick={onUrge}>
								딴짓 충동
							</Button>
							<Button
								variant="ghost"
								className="h-11 flex-1 text-text-secondary"
								onClick={onAction}
							>
								종료
							</Button>
						</div>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}

function getStatusText(moduleState: EngineModuleState, remainingSeconds: number): string {
	switch (moduleState.status) {
		case "NO_BASELINE":
			return "첫 기록을 시작해보세요";
		case "COUNTDOWN":
			if (remainingSeconds <= 0) return "목표 시간 도달";
			if (remainingSeconds <= 60) return "거의 다 왔어요";
			return "목표까지 대기 중";
		case "READY":
			return "목표 달성, 기록 가능";
		case "GAP_DETECTED":
			return "다시 시작할 준비가 됐어요";
		default:
			return "";
	}
}
