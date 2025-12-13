import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/date";
import { MODULE_CONFIGS } from "@/types/engine.type";
import type { EngineModuleState } from "@/types/engine.type";

interface ModuleCardProps {
	moduleState: EngineModuleState;
	onAction: () => void;
	onUrge: () => void;
}

export function ModuleCard({ moduleState, onAction, onUrge }: ModuleCardProps) {
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
