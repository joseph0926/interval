import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CapsuleRow } from "@/components/primitives";
import { formatTime } from "@/lib/date";
import { MODULE_CONFIGS, isFocusStatus } from "@/types/engine.type";
import { getModuleColor } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { EngineModuleState } from "@/types/engine.type";

interface ModuleListProps {
	modules: EngineModuleState[];
	onModuleAction: (moduleState: EngineModuleState) => void;
	onModuleUrge: (moduleState: EngineModuleState) => void;
	className?: string;
}

export function ModuleList({ modules, onModuleAction, onModuleUrge, className }: ModuleListProps) {
	const prefersReducedMotion = useReducedMotion();

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.08, delayChildren: 0.2 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, x: -10 },
		visible: { opacity: 1, x: 0 },
	};

	return (
		<motion.div
			variants={prefersReducedMotion ? undefined : containerVariants}
			initial="hidden"
			animate="visible"
			className={cn("flex flex-col gap-3", className)}
		>
			{modules.map((moduleState) => (
				<motion.div
					key={moduleState.moduleType}
					variants={prefersReducedMotion ? undefined : itemVariants}
				>
					{isFocusStatus(moduleState.status) ? (
						<FocusModuleItem moduleState={moduleState} onOpen={() => onModuleAction(moduleState)} />
					) : (
						<IntervalModuleItem
							moduleState={moduleState}
							onOpenAction={() => onModuleAction(moduleState)}
							onOpenUrge={() => onModuleUrge(moduleState)}
						/>
					)}
				</motion.div>
			))}
		</motion.div>
	);
}

function IntervalModuleItem({
	moduleState,
	onOpenAction,
	onOpenUrge,
}: {
	moduleState: EngineModuleState;
	onOpenAction: () => void;
	onOpenUrge: () => void;
}) {
	const config = MODULE_CONFIGS[moduleState.moduleType];
	const colors = getModuleColor(moduleState.moduleType);

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
	const isGap = moduleState.status === "GAP_DETECTED";

	const subtitle = getIntervalSubtitle(moduleState.status, remainingSeconds);

	const showNet = Math.abs(moduleState.todayNetMin) >= 1;
	const affordance = getAffordance(moduleState.status);

	const onRowClick = isCountdown ? onOpenUrge : onOpenAction;
	const variant = isReady ? "ready" : isGap ? "warning" : isCountdown ? "active" : "default";

	const rightContent = showNet ? (
		<ChevronRight className="size-5 text-text-tertiary" aria-hidden="true" />
	) : (
		<RowAffordance label={affordance.label} tone={affordance.tone} />
	);

	return (
		<CapsuleRow
			variant={variant}
			onClick={onRowClick}
			icon={<span className="text-2xl">{config.icon}</span>}
			iconBg={cn(
				isReady && "bg-success-muted",
				isGap && "bg-warning-muted",
				!isReady && !isGap && colors.muted,
			)}
			title={config.label}
			subtitle={subtitle}
			netMin={moduleState.todayNetMin}
			countdown={
				isCountdown && moduleState.targetTime && moduleState.targetIntervalMin
					? {
							targetTime: moduleState.targetTime,
							targetIntervalMin: moduleState.targetIntervalMin,
						}
					: undefined
			}
			rightContent={rightContent}
		/>
	);
}

function FocusModuleItem({
	moduleState,
	onOpen,
}: {
	moduleState: EngineModuleState;
	onOpen: () => void;
}) {
	const config = MODULE_CONFIGS[moduleState.moduleType];
	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	const isRunning = moduleState.status === "FOCUS_RUNNING";
	const session = moduleState.focusSession;

	useEffect(() => {
		if (!isRunning || !session) {
			setElapsedSeconds(0);
			return;
		}

		const sessionStartTime = new Date(session.sessionStartTime);

		const updateTimer = () => {
			const now = new Date();
			const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
			setElapsedSeconds(elapsed);
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [isRunning, session]);

	const subtitle = getFocusSubtitle(moduleState.status, elapsedSeconds);

	const showNet = Math.abs(moduleState.todayNetMin) >= 1;
	const affordance = getAffordance(moduleState.status);

	const rightContent = showNet ? (
		<ChevronRight className="size-5 text-text-tertiary" aria-hidden="true" />
	) : (
		<RowAffordance label={affordance.label} tone={affordance.tone} />
	);

	return (
		<CapsuleRow
			variant={
				isRunning ? "active" : moduleState.status === "FOCUS_COACHING" ? "warning" : "default"
			}
			onClick={onOpen}
			icon={<span className="text-2xl">{config.icon}</span>}
			iconBg={isRunning ? "bg-focus/15" : "bg-muted/50 dark:bg-white/5"}
			title={config.label}
			subtitle={subtitle}
			netMin={moduleState.todayNetMin}
			rightContent={rightContent}
		/>
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

function getFocusSubtitle(status: string, elapsedSeconds: number): string {
	switch (status) {
		case "FOCUS_IDLE":
			return "집중을 시작해볼까요?";
		case "FOCUS_RUNNING":
			return `${formatTime(elapsedSeconds)} 집중 중`;
		case "FOCUS_COACHING":
			return "흐트러짐 감지 · 30초 숨 고르기";
		default:
			return "";
	}
}

function getAffordance(status: string): {
	label: string;
	tone: "primary" | "success" | "warning" | "focus" | "muted";
} {
	switch (status) {
		case "NO_BASELINE":
			return { label: "첫 기록", tone: "primary" };
		case "READY":
			return { label: "기록", tone: "success" };
		case "COUNTDOWN":
			return { label: "기다리기", tone: "primary" };
		case "GAP_DETECTED":
			return { label: "다시 시작", tone: "primary" };
		case "SETUP_REQUIRED":
			return { label: "설정", tone: "primary" };
		case "FOCUS_IDLE":
			return { label: "시작", tone: "focus" };
		case "FOCUS_RUNNING":
			return { label: "종료", tone: "focus" };
		case "FOCUS_COACHING":
			return { label: "숨 고르기", tone: "warning" };
		default:
			return { label: "열기", tone: "muted" };
	}
}

function RowAffordance({
	label,
	tone,
}: {
	label: string;
	tone: "primary" | "success" | "warning" | "focus" | "muted";
}) {
	const pill = cn(
		"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
		"ring-1 ring-inset ring-white/10",
		tone === "success" && "bg-success/12 text-success",
		tone === "warning" && "bg-warning/12 text-warning",
		tone === "focus" && "bg-focus/12 text-focus",
		tone === "primary" && "bg-primary/12 text-primary",
		tone === "muted" && "bg-white/6 text-text-secondary",
	);

	return (
		<div className="flex items-center gap-2">
			<span className={pill}>{label}</span>
			<ChevronRight className="size-5 text-text-tertiary" aria-hidden="true" />
		</div>
	);
}
