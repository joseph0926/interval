import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
	DrawerFooter,
	DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { MODULE_CONFIGS, isFocusStatus } from "@/types/engine.type";
import { drawerContent } from "@/lib/motion";
import type { EngineModuleState, EngineModuleType, EngineReasonLabel } from "@/types/engine.type";

interface ModuleDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	moduleState: EngineModuleState;
	mode: "action" | "urge" | "gap";
	onComplete: () => void;
}

const REASON_OPTIONS: Array<{ code: EngineReasonLabel; emoji: string; label: string }> = [
	{ code: "BREAK", emoji: "⏸", label: "쉬는 시간" },
	{ code: "STRESS", emoji: "😫", label: "스트레스" },
	{ code: "HABIT", emoji: "😐", label: "습관" },
	{ code: "BORED", emoji: "🥱", label: "지루해서" },
	{ code: "LINK", emoji: "👫", label: "누군가와 함께" },
	{ code: "OTHER", emoji: "✏️", label: "기타" },
];

const DELAY_OPTIONS = [1, 3, 5, 10] as const;
const FOCUS_EXTEND_OPTIONS = [5, 10] as const;

export function ModuleDrawer({
	open,
	onOpenChange,
	moduleState,
	mode,
	onComplete,
}: ModuleDrawerProps) {
	const isFocus = isFocusStatus(moduleState.status);

	if (isFocus) {
		return (
			<FocusModuleDrawer
				open={open}
				onOpenChange={onOpenChange}
				moduleState={moduleState}
				mode={mode}
				onComplete={onComplete}
			/>
		);
	}

	return (
		<IntervalModuleDrawer
			open={open}
			onOpenChange={onOpenChange}
			moduleState={moduleState}
			mode={mode}
			onComplete={onComplete}
		/>
	);
}

function IntervalModuleDrawer({
	open,
	onOpenChange,
	moduleState,
	mode,
	onComplete,
}: ModuleDrawerProps) {
	const config = MODULE_CONFIGS[moduleState.moduleType];
	const [step, setStep] = useState<"main" | "reason" | "coaching">("main");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isCountdown = moduleState.status === "COUNTDOWN";
	const remainingMin = moduleState.remainingMin ?? 0;

	const handleAction = useCallback(
		async (reasonLabel?: EngineReasonLabel) => {
			if (isSubmitting) return;
			setIsSubmitting(true);
			try {
				await api.engine.action({
					moduleType: moduleState.moduleType as EngineModuleType,
					reasonLabel,
				});
				onComplete();
				onOpenChange(false);
			} finally {
				setIsSubmitting(false);
			}
		},
		[isSubmitting, moduleState.moduleType, onComplete, onOpenChange],
	);

	const handleDelay = useCallback(
		async (minutes: 1 | 3 | 5 | 10) => {
			if (isSubmitting) return;
			setIsSubmitting(true);
			try {
				await api.engine.delay({
					moduleType: moduleState.moduleType as EngineModuleType,
					delayMinutes: minutes,
					triggerContext: "EARLY_URGE",
				});
				onComplete();
				onOpenChange(false);
			} finally {
				setIsSubmitting(false);
			}
		},
		[isSubmitting, moduleState.moduleType, onComplete, onOpenChange],
	);

	const handleGapRecovery = useCallback(async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			await api.engine.adjustment({
				moduleType: moduleState.moduleType as EngineModuleType,
				adjustmentKind: "RESET_BASELINE",
			});
			onComplete();
			onOpenChange(false);
		} finally {
			setIsSubmitting(false);
		}
	}, [isSubmitting, moduleState.moduleType, onComplete, onOpenChange]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setStep("main");
		}
		onOpenChange(open);
	};

	const getTitle = () => {
		if (mode === "gap") return "복귀하기";
		if (moduleState.status === "NO_BASELINE") return `오늘 첫 ${config.label}`;
		if (isCountdown && mode === "urge") return "잠깐, 미뤄볼까요?";
		return `${config.label} 기록`;
	};

	const getDescription = () => {
		if (mode === "gap") return "오랜만이에요. 지금부터 다시 시작할까요?";
		if (isCountdown && mode === "urge") {
			return `목표까지 ${remainingMin}분 남았어요`;
		}
		return "";
	};

	return (
		<Drawer open={open} onOpenChange={handleOpenChange}>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>{getTitle()}</DrawerTitle>
					<DrawerDescription>
						{getDescription() || <span className="sr-only">{config.label} 기록을 입력하세요</span>}
					</DrawerDescription>
				</DrawerHeader>

				<div className="px-4 pb-6">
					<AnimatePresence mode="wait">
						{mode === "gap" && (
							<motion.div
								key="gap"
								variants={drawerContent}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								<GapContent onRecover={handleGapRecovery} isSubmitting={isSubmitting} />
							</motion.div>
						)}

						{mode === "action" && step === "main" && (
							<motion.div
								key="action-main"
								variants={drawerContent}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								<UnifiedActionContent
									isCountdown={isCountdown}
									remainingMin={remainingMin}
									onQuickAction={() => handleAction()}
									onWithReason={() => setStep("reason")}
									onDelay={handleDelay}
									isSubmitting={isSubmitting}
								/>
							</motion.div>
						)}

						{mode === "action" && step === "reason" && (
							<motion.div
								key="action-reason"
								variants={drawerContent}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								<ReasonSelectContent
									onSelect={(reason) => handleAction(reason)}
									onBack={() => setStep("main")}
									isSubmitting={isSubmitting}
								/>
							</motion.div>
						)}

						{mode === "urge" && step === "main" && (
							<motion.div
								key="urge-main"
								variants={drawerContent}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								<UnifiedUrgeContent
									remainingMin={remainingMin}
									onDelay={handleDelay}
									onCoaching={() => setStep("coaching")}
									onAction={() => handleAction()}
									isSubmitting={isSubmitting}
								/>
							</motion.div>
						)}

						{mode === "urge" && step === "coaching" && (
							<motion.div
								key="urge-coaching"
								variants={drawerContent}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								<CoachingContent
									onComplete={() => handleDelay(3)}
									onSkip={() => handleAction()}
									isSubmitting={isSubmitting}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

function UnifiedActionContent({
	isCountdown,
	remainingMin,
	onQuickAction,
	onWithReason,
	onDelay,
	isSubmitting,
}: {
	isCountdown: boolean;
	remainingMin: number;
	onQuickAction: () => void;
	onWithReason: () => void;
	onDelay: (minutes: 1 | 3 | 5 | 10) => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-4">
			{isCountdown && remainingMin > 0 && (
				<div className="rounded-xl border border-warning/30 bg-warning-muted p-3">
					<p className="text-sm text-text-secondary">
						목표까지 <span className="font-semibold text-warning">{remainingMin}분</span> 남았어요
					</p>
				</div>
			)}

			{isCountdown && <QuickDelayChips onDelay={onDelay} isSubmitting={isSubmitting} />}

			<div className="flex flex-col gap-2">
				<Button
					onClick={onQuickAction}
					disabled={isSubmitting}
					className="h-12 w-full"
					variant={isCountdown ? "outline" : "default"}
				>
					{isSubmitting ? "기록 중..." : "지금 기록하기"}
				</Button>
				<Button
					onClick={onWithReason}
					disabled={isSubmitting}
					variant="ghost"
					className="h-10 w-full text-text-secondary"
				>
					이유와 함께 기록
				</Button>
			</div>
		</div>
	);
}

function UnifiedUrgeContent({
	remainingMin,
	onDelay,
	onCoaching,
	onAction,
	isSubmitting,
}: {
	remainingMin: number;
	onDelay: (minutes: 1 | 3 | 5 | 10) => void;
	onCoaching: () => void;
	onAction: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-5">
			<div className="text-center">
				<div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10">
					<span className="text-2xl">🧘</span>
				</div>
				<p className="text-sm text-text-secondary">
					잠깐 멈추고 <span className="font-medium text-foreground">{remainingMin}분</span>만 더
					기다려볼까요?
				</p>
			</div>

			<QuickDelayChips onDelay={onDelay} isSubmitting={isSubmitting} highlight />

			<div className="flex flex-col gap-2">
				<Button
					onClick={onCoaching}
					disabled={isSubmitting}
					variant="outline"
					className="h-11 w-full"
				>
					30초 호흡하고 결정하기
				</Button>
				<Button
					onClick={onAction}
					disabled={isSubmitting}
					variant="ghost"
					className="h-10 w-full text-text-tertiary"
				>
					{isSubmitting ? "기록 중..." : "지금 기록하기"}
				</Button>
			</div>
		</div>
	);
}

function QuickDelayChips({
	onDelay,
	isSubmitting,
	highlight = false,
}: {
	onDelay: (minutes: 1 | 3 | 5 | 10) => void;
	isSubmitting: boolean;
	highlight?: boolean;
}) {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-xs font-medium text-text-tertiary">빠른 미루기</p>
			<div className="grid grid-cols-4 gap-2" role="group" aria-label="미루기 시간 선택">
				{DELAY_OPTIONS.map((minutes) => (
					<button
						key={minutes}
						type="button"
						onClick={() => onDelay(minutes)}
						disabled={isSubmitting}
						className={`flex h-12 flex-col items-center justify-center rounded-xl border transition-all active:scale-95 disabled:opacity-50 ${
							highlight
								? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
								: "border-border bg-surface hover:border-primary/50 hover:bg-surface-elevated"
						}`}
						aria-label={`${minutes}분 미루기`}
					>
						<span className="text-lg font-bold">{minutes}</span>
						<span className="text-[10px] text-text-tertiary">분</span>
					</button>
				))}
			</div>
		</div>
	);
}

function FocusModuleDrawer({
	open,
	onOpenChange,
	moduleState,
	mode,
	onComplete,
}: ModuleDrawerProps) {
	const config = MODULE_CONFIGS[moduleState.moduleType];
	const [step, setStep] = useState<"select" | "coaching" | "extend">("select");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const defaultSessionMin = moduleState.defaultSessionMin ?? 10;

	const handleStartSession = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			await api.engine.action({
				moduleType: moduleState.moduleType as EngineModuleType,
				actionKind: "SESSION_START",
				payload: { plannedMinutes: defaultSessionMin },
			});
			onComplete();
			onOpenChange(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEndSession = async (endReason: "USER_END" | "URGE" = "USER_END") => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			await api.engine.action({
				moduleType: moduleState.moduleType as EngineModuleType,
				actionKind: "SESSION_END",
				payload: { endReason },
			});
			onComplete();
			onOpenChange(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleExtend = async (minutes: number) => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			await api.engine.delay({
				moduleType: moduleState.moduleType as EngineModuleType,
				delayMinutes: minutes as 1 | 3 | 5 | 10,
				triggerContext: "FOCUS_EXTEND",
			});
			onComplete();
			onOpenChange(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setStep("select");
		}
		onOpenChange(open);
	};

	const getTitle = () => {
		if (moduleState.status === "FOCUS_IDLE") return "집중 세션 시작";
		if (mode === "urge") return "딴짓 충동";
		return "집중 세션 종료";
	};

	return (
		<Drawer open={open} onOpenChange={handleOpenChange}>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>{getTitle()}</DrawerTitle>
					<DrawerDescription className="sr-only">
						{config.label} 세션을 관리하세요
					</DrawerDescription>
				</DrawerHeader>

				<div className="px-4 pb-4">
					{moduleState.status === "FOCUS_IDLE" && mode === "action" && (
						<FocusStartContent
							defaultSessionMin={defaultSessionMin}
							onStart={handleStartSession}
							isSubmitting={isSubmitting}
						/>
					)}

					{moduleState.status === "FOCUS_RUNNING" && mode === "action" && (
						<FocusEndContent
							onEnd={() => handleEndSession("USER_END")}
							isSubmitting={isSubmitting}
						/>
					)}

					{moduleState.status === "FOCUS_RUNNING" && mode === "urge" && step === "select" && (
						<FocusUrgeSelectContent
							onCoaching={() => setStep("coaching")}
							onEnd={() => handleEndSession("URGE")}
							isSubmitting={isSubmitting}
						/>
					)}

					{mode === "urge" && step === "coaching" && (
						<CoachingContent
							onComplete={() => setStep("extend")}
							onSkip={() => handleEndSession("URGE")}
							isSubmitting={isSubmitting}
						/>
					)}

					{mode === "urge" && step === "extend" && (
						<FocusExtendContent
							onExtend={handleExtend}
							onEnd={() => handleEndSession("URGE")}
							isSubmitting={isSubmitting}
						/>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}

function GapContent({ onRecover, isSubmitting }: { onRecover: () => void; isSubmitting: boolean }) {
	return (
		<div className="flex flex-col gap-4" role="region" aria-label="복귀 안내">
			<div className="text-center">
				<div
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10"
					aria-hidden="true"
				>
					<span className="text-2xl">👋</span>
				</div>
				<p className="mt-3 text-lg font-medium">다시 시작할 준비가 됐어요</p>
				<p className="mt-1 text-sm text-text-secondary">지금부터 새롭게 기록을 시작할 수 있어요</p>
			</div>
			<Button
				onClick={onRecover}
				disabled={isSubmitting}
				className="h-12 w-full"
				aria-busy={isSubmitting}
			>
				{isSubmitting ? "처리 중..." : "지금부터 시작하기"}
			</Button>
		</div>
	);
}

function ReasonSelectContent({
	onSelect,
	onBack,
	isSubmitting,
}: {
	onSelect: (reason: EngineReasonLabel) => void;
	onBack: () => void;
	isSubmitting: boolean;
}) {
	const [selectedReason, setSelectedReason] = useState<EngineReasonLabel | null>(null);

	const handleSelect = (reason: EngineReasonLabel) => {
		setSelectedReason(reason);
		onSelect(reason);
	};

	return (
		<div className="flex flex-col gap-3">
			<p className="mb-2 text-sm text-muted-foreground">
				{isSubmitting ? "기록하는 중..." : "왜 지금 하게 됐나요?"}
			</p>
			<div className="grid grid-cols-2 gap-2">
				{REASON_OPTIONS.map((reason, idx) => (
					<motion.button
						key={reason.code}
						type="button"
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: idx * 0.02 }}
						onClick={() => handleSelect(reason.code)}
						disabled={isSubmitting}
						className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
							selectedReason === reason.code
								? "border-primary bg-primary/10"
								: "border-border bg-card hover:border-primary/50"
						}`}
					>
						<span>{reason.emoji}</span>
						<span className="text-sm">{reason.label}</span>
					</motion.button>
				))}
			</div>
			<Button variant="ghost" onClick={onBack} disabled={isSubmitting} className="mt-2">
				뒤로
			</Button>
		</div>
	);
}

function CoachingContent({
	onComplete,
	onSkip,
	isSubmitting,
}: {
	onComplete: () => void;
	onSkip: () => void;
	isSubmitting: boolean;
}) {
	const [seconds, setSeconds] = useState(30);
	const [started, setStarted] = useState(false);

	const handleStart = () => {
		setStarted(true);
		const interval = setInterval(() => {
			setSeconds((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	if (!started) {
		return (
			<div className="flex flex-col items-center gap-6" role="region" aria-label="호흡 운동">
				<div className="text-center">
					<div
						className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10"
						aria-hidden="true"
					>
						<span className="text-2xl">🧘</span>
					</div>
					<h3 className="mt-3 text-lg font-semibold">30초 호흡하기</h3>
					<p className="mt-1 text-sm text-text-secondary">잠깐 멈추고 호흡에 집중해보세요</p>
				</div>
				<Button onClick={handleStart} className="h-12 w-full">
					시작하기
				</Button>
				<Button variant="ghost" onClick={onSkip} disabled={isSubmitting} className="h-11">
					건너뛰기
				</Button>
			</div>
		);
	}

	if (seconds === 0) {
		return (
			<div className="flex flex-col items-center gap-6" role="region" aria-label="호흡 완료">
				<div className="text-center">
					<div
						className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-muted"
						aria-hidden="true"
					>
						<span className="text-2xl">✓</span>
					</div>
					<h3 className="mt-3 text-lg font-semibold">30초 간격을 만들었어요</h3>
					<p className="mt-1 text-sm text-text-secondary">다음 단계를 선택하세요</p>
				</div>
				<Button onClick={onComplete} className="h-12 w-full">
					미루기 옵션 보기
				</Button>
				<Button
					variant="ghost"
					onClick={onSkip}
					disabled={isSubmitting}
					className="h-11 text-text-tertiary"
				>
					지금 기록하기
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-6" role="region" aria-label="호흡 진행 중">
			<div className="text-center">
				<p className="text-6xl font-bold tabular-nums" aria-live="polite" aria-atomic="true">
					{seconds}
				</p>
				<p className="mt-2 text-sm text-text-secondary">천천히 호흡하세요</p>
			</div>
		</div>
	);
}

function FocusStartContent({
	defaultSessionMin,
	onStart,
	isSubmitting,
}: {
	defaultSessionMin: number;
	onStart: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-4" role="region" aria-label="집중 세션 시작">
			<div className="text-center">
				<div
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-focus/10"
					aria-hidden="true"
				>
					<span className="text-2xl">🎯</span>
				</div>
				<h3 className="mt-3 text-lg font-semibold">집중 세션 시작</h3>
				<p className="mt-1 text-sm text-text-secondary">{defaultSessionMin}분 동안 집중해볼까요?</p>
			</div>
			<Button
				onClick={onStart}
				disabled={isSubmitting}
				className="h-12 w-full"
				aria-busy={isSubmitting}
			>
				{isSubmitting ? "시작하는 중..." : `${defaultSessionMin}분 집중 시작`}
			</Button>
			<DrawerFooter className="px-0">
				<DrawerClose asChild>
					<Button variant="ghost" className="h-11 w-full">
						취소
					</Button>
				</DrawerClose>
			</DrawerFooter>
		</div>
	);
}

function FocusEndContent({ onEnd, isSubmitting }: { onEnd: () => void; isSubmitting: boolean }) {
	return (
		<div className="flex flex-col gap-4" role="region" aria-label="집중 세션 종료">
			<div className="text-center">
				<div
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface-elevated"
					aria-hidden="true"
				>
					<span className="text-2xl">⏹️</span>
				</div>
				<h3 className="mt-3 text-lg font-semibold">세션을 종료할까요?</h3>
				<p className="mt-1 text-sm text-text-secondary">지금까지의 집중 시간이 기록됩니다</p>
			</div>
			<Button
				onClick={onEnd}
				disabled={isSubmitting}
				className="h-12 w-full"
				aria-busy={isSubmitting}
			>
				{isSubmitting ? "종료하는 중..." : "세션 종료"}
			</Button>
			<DrawerFooter className="px-0">
				<DrawerClose asChild>
					<Button variant="ghost" className="h-11 w-full">
						계속 집중하기
					</Button>
				</DrawerClose>
			</DrawerFooter>
		</div>
	);
}

function FocusUrgeSelectContent({
	onCoaching,
	onEnd,
	isSubmitting,
}: {
	onCoaching: () => void;
	onEnd: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-6" role="region" aria-label="집중 중 선택">
			<div className="text-center">
				<div
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-focus/10"
					aria-hidden="true"
				>
					<span className="text-2xl">🤔</span>
				</div>
				<h3 className="mt-3 text-lg font-semibold">잠시 멈추고 싶으신가요?</h3>
				<p className="mt-1 text-sm text-text-secondary">선택해주세요</p>
			</div>
			<div className="flex flex-col gap-3">
				<motion.button
					type="button"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					onClick={onCoaching}
					disabled={isSubmitting}
					className="min-h-14 rounded-xl border border-primary bg-primary/5 px-4 py-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
				>
					<p className="font-medium text-primary">30초 호흡하고 결정하기</p>
					<p className="mt-1 text-sm text-text-tertiary">호흡 후 연장 여부를 선택해요</p>
				</motion.button>
				<motion.button
					type="button"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.03 }}
					onClick={onEnd}
					disabled={isSubmitting}
					className="min-h-14 rounded-xl border border-border bg-surface px-4 py-4 text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
					aria-busy={isSubmitting}
				>
					<p className="font-medium">{isSubmitting ? "종료하는 중..." : "세션 종료하기"}</p>
					<p className="mt-1 text-sm text-text-tertiary">지금까지의 시간이 기록됩니다</p>
				</motion.button>
			</div>
			<DrawerFooter className="px-0">
				<DrawerClose asChild>
					<Button variant="ghost" className="h-11 w-full" disabled={isSubmitting}>
						계속 집중하기
					</Button>
				</DrawerClose>
			</DrawerFooter>
		</div>
	);
}

function FocusExtendContent({
	onExtend,
	onEnd,
	isSubmitting,
}: {
	onExtend: (minutes: number) => void;
	onEnd: () => void;
	isSubmitting: boolean;
}) {
	const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);

	const handleExtend = (minutes: number) => {
		setSelectedMinutes(minutes);
		onExtend(minutes);
	};

	return (
		<div className="flex flex-col gap-4" role="region" aria-label="집중 연장 선택">
			<div className="text-center">
				<div
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-muted"
					aria-hidden="true"
				>
					<span className="text-2xl">✓</span>
				</div>
				<h3 className="mt-3 text-lg font-semibold">30초 간격을 만들었어요</h3>
				<p className="mt-1 text-sm text-text-secondary">
					{isSubmitting ? "처리 중..." : "연장하면 거리 통장에 적립돼요"}
				</p>
			</div>
			<div className="grid grid-cols-2 gap-2" role="group" aria-label="연장 시간 선택">
				{FOCUS_EXTEND_OPTIONS.map((minutes, idx) => (
					<motion.button
						key={minutes}
						type="button"
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: idx * 0.02 }}
						onClick={() => handleExtend(minutes)}
						disabled={isSubmitting}
						className={`min-h-14 rounded-xl border px-4 py-4 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
							selectedMinutes === minutes ? "border-focus bg-focus/20" : "border-focus bg-focus/5"
						}`}
						aria-label={`${minutes}분 연장`}
					>
						<p className="text-2xl font-bold text-focus">+{minutes}분</p>
					</motion.button>
				))}
			</div>
			<Button
				variant="ghost"
				onClick={onEnd}
				disabled={isSubmitting}
				className="mt-2 h-11 text-text-tertiary"
			>
				{isSubmitting ? "종료하는 중..." : "세션 종료하기"}
			</Button>
		</div>
	);
}
