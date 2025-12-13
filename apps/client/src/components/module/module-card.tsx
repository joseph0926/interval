import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/date";
import { MODULE_CONFIGS, isFocusStatus } from "@/types/engine.type";
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

	const progress =
		isCountdown && moduleState.targetIntervalMin
			? Math.min(1, 1 - remainingSeconds / (moduleState.targetIntervalMin * 60))
			: isReady
				? 1
				: 0;

	const isCaffeine = moduleState.moduleType === "CAFFEINE";
	const actionCount = moduleState.todayActionCount ?? 0;
	const dailyGoal = moduleState.dailyGoalCount;

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<span className="text-2xl">{config.icon}</span>
						<div>
							<p className="font-medium">{config.label}</p>
							<p className="text-sm text-muted-foreground">
								{getStatusText(moduleState, remainingSeconds)}
							</p>
						</div>
					</div>
					<div className="text-right">
						<p className={`text-lg font-bold ${config.color}`}>+{moduleState.todayNetMin}분</p>
						<p className="text-xs text-muted-foreground">오늘 벌어낸 거리</p>
					</div>
				</div>

				{isCaffeine && (
					<div className="mt-3 flex items-center gap-2 text-sm">
						<span className="text-muted-foreground">오늘 커피</span>
						<span className="font-medium">{actionCount}잔</span>
						{dailyGoal && <span className="text-muted-foreground">/ 목표 {dailyGoal}잔</span>}
					</div>
				)}

				{isCountdown && (
					<div className="mt-4">
						<div className="mb-2 flex items-center justify-between">
							<span className="text-3xl font-bold tabular-nums">
								{formatTime(remainingSeconds)}
							</span>
							<span className="text-sm text-muted-foreground">
								목표 {moduleState.targetIntervalMin}분
							</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-muted">
							<motion.div
								className="h-full bg-primary"
								initial={{ width: 0 }}
								animate={{ width: `${progress * 100}%` }}
								transition={{ duration: 0.5 }}
							/>
						</div>
					</div>
				)}

				<div className="mt-4 flex gap-2">
					{isGap ? (
						<Button className="flex-1" onClick={onAction}>
							복귀하기
						</Button>
					) : isReady || isNoBaseline ? (
						<Button className="flex-1" onClick={onAction}>
							{config.actionLabel}
						</Button>
					) : (
						<>
							<Button variant="outline" className="flex-1" onClick={onUrge}>
								{config.urgeLabel}
							</Button>
							<Button variant="ghost" className="flex-1" onClick={onAction}>
								{config.actionLabel}
							</Button>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
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

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<span className="text-2xl">{config.icon}</span>
						<div>
							<p className="font-medium">{config.label}</p>
							<p className="text-sm text-muted-foreground">
								{isIdle && "집중 세션을 시작해보세요"}
								{isRunning && `집중 ${Math.floor(elapsedSeconds / 60)}분째`}
							</p>
						</div>
					</div>
					<div className="text-right">
						<p className={`text-lg font-bold ${config.color}`}>+{moduleState.todayNetMin}분</p>
						<p className="text-xs text-muted-foreground">오늘 거리 통장</p>
					</div>
				</div>

				<div className="mt-3 flex items-center gap-2 text-sm">
					<span className="text-muted-foreground">오늘 총 집중</span>
					<span className="font-medium">{totalFocusMin}분</span>
				</div>

				{isRunning && session && (
					<div className="mt-4">
						<div className="mb-2 flex items-center justify-between">
							<div className="flex flex-col">
								<span className="text-3xl font-bold tabular-nums text-primary">
									{formatTime(elapsedSeconds)}
								</span>
								<span className="text-xs text-muted-foreground">경과</span>
							</div>
							<div className="flex flex-col items-end">
								<span className="text-xl font-medium tabular-nums">
									{formatTime(remainingSeconds)}
								</span>
								<span className="text-xs text-muted-foreground">남음</span>
							</div>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-muted">
							<motion.div
								className="h-full bg-purple-500"
								initial={{ width: 0 }}
								animate={{
									width: `${Math.min(100, (elapsedSeconds / ((session.plannedMinutes + session.extendedMinutes) * 60)) * 100)}%`,
								}}
								transition={{ duration: 0.5 }}
							/>
						</div>
						{session.extendedMinutes > 0 && (
							<p className="mt-1 text-xs text-muted-foreground">
								+{session.extendedMinutes}분 연장됨
							</p>
						)}
					</div>
				)}

				<div className="mt-4 flex gap-2">
					{isIdle ? (
						<Button className="flex-1" onClick={onAction}>
							집중 세션 시작 ({defaultSessionMin}분)
						</Button>
					) : isRunning ? (
						<>
							<Button variant="outline" className="flex-1" onClick={onUrge}>
								{config.urgeLabel}
							</Button>
							<Button variant="ghost" className="flex-1" onClick={onAction}>
								{config.actionLabel}
							</Button>
						</>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}

function getStatusText(moduleState: EngineModuleState, remainingSeconds: number): string {
	switch (moduleState.status) {
		case "NO_BASELINE":
			return "오늘 첫 기록을 해주세요";
		case "COUNTDOWN":
			return remainingSeconds > 0 ? "목표까지 기다리는 중" : "곧 목표 도달!";
		case "READY":
			return "목표 달성! 해도 괜찮아요";
		case "GAP_DETECTED":
			return "오랜만이네요, 복귀해주세요";
		default:
			return "";
	}
}
