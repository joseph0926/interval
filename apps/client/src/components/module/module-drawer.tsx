import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ActionSheet, ActionSheetButton, ActionSheetChipGroup } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { MODULE_CONFIGS, isFocusStatus } from "@/types/engine.type";
import { drawerContent } from "@/lib/motion";
import { cn } from "@/lib/utils";
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

const DELAY_CHIPS = [
	{ label: "1분", value: 1, highlight: false },
	{ label: "3분", value: 3, highlight: false },
	{ label: "5분", value: 5, highlight: true },
	{ label: "10분", value: 10, highlight: false },
];

const FOCUS_EXTEND_OPTIONS = [5, 10] as const;

function nowLabel(actionLabel: string) {
	return `지금 ${actionLabel}`;
}

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
	const actionLabel = config?.actionLabel ?? "기록했어요";

	const [step, setStep] = useState<"main" | "reason" | "coaching">("main");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isCountdown = moduleState.status === "COUNTDOWN";
	const remainingMin = moduleState.remainingMin ?? 0;
	const canCharge = isCountdown && remainingMin > 0;

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
		async (minutes: number) => {
			if (isSubmitting) return;
			setIsSubmitting(true);
			try {
				await api.engine.delay({
					moduleType: moduleState.moduleType as EngineModuleType,
					delayMinutes: minutes as 1 | 3 | 5 | 10,
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
		if (!open) setStep("main");
		onOpenChange(open);
	};

	const getTitle = () => {
		if (mode === "gap") return "다시 시작하기";
		if (moduleState.status === "NO_BASELINE") return `오늘 첫 ${config.label}`;
		if (isCountdown && mode === "urge") return "잠깐만 기다려요";
		return `${config.label} 기록`;
	};

	const getStatusMessage = () => {
		if (mode === "gap") {
			return { text: "오랜만이에요. 오늘부터 다시 시작해요", variant: "info" as const };
		}

		if (isCountdown && mode === "urge") {
			if (remainingMin <= 0) {
				return { text: "이제 기록할 수 있어요", variant: "info" as const };
			}
			return { text: `다음 기록까지 ${remainingMin}분 남았어요`, variant: "warning" as const };
		}

		if (isCountdown && mode === "action" && remainingMin > 0) {
			return {
				text: `지금 기록하면 ${remainingMin}분이 차감될 수 있어요`,
				variant: "warning" as const,
			};
		}

		return undefined;
	};

	return (
		<ActionSheet
			open={open}
			onOpenChange={handleOpenChange}
			title={getTitle()}
			statusMessage={getStatusMessage()}
		>
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
							canCharge={canCharge}
							actionLabel={actionLabel}
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
							actionLabel={actionLabel}
							remainingMin={remainingMin}
							canCharge={canCharge}
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
							introTitle="30초 숨 고르기"
							introDescription="잠깐 멈추고 호흡에 집중해보세요"
							doneTitle="좋아요. 간격이 생겼어요"
							doneDescription="조금 더 기다리면 적립이 늘어요"
							completeLabel="3분 더 기다리기"
							skipLabel={nowLabel(actionLabel)}
							onComplete={() => handleDelay(3)}
							onSkip={() => handleAction()}
							isSubmitting={isSubmitting}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</ActionSheet>
	);
}

function UnifiedActionContent({
	isCountdown,
	remainingMin,
	canCharge,
	actionLabel,
	onQuickAction,
	onWithReason,
	onDelay,
	isSubmitting,
}: {
	isCountdown: boolean;
	remainingMin: number;
	canCharge: boolean;
	actionLabel: string;
	onQuickAction: () => void;
	onWithReason: () => void;
	onDelay: (minutes: number) => void;
	isSubmitting: boolean;
}) {
	const primaryLabel = isCountdown ? nowLabel(actionLabel) : actionLabel;

	return (
		<div className="flex flex-col gap-4">
			{isCountdown ? (
				<div className="flex flex-col gap-2">
					<ActionSheetChipGroup
						label="잠깐만 기다리기"
						chips={DELAY_CHIPS}
						onSelect={onDelay}
						disabled={isSubmitting}
					/>
					<p className="text-xs text-text-tertiary">기다린 시간만큼 오늘 적립이 늘어요</p>
				</div>
			) : null}

			<div className="flex flex-col gap-2">
				<ActionSheetButton
					variant={isCountdown ? "secondary" : "primary"}
					size="lg"
					onClick={onQuickAction}
					loading={isSubmitting}
				>
					{primaryLabel}
				</ActionSheetButton>

				{canCharge ? (
					<p className="text-xs text-text-tertiary text-center">
						지금 기록하면{" "}
						<span className="font-medium text-text-secondary tabular-nums">{remainingMin}분</span>이
						차감될 수 있어요
					</p>
				) : null}

				<ActionSheetButton variant="ghost" onClick={onWithReason} disabled={isSubmitting}>
					이유를 남기고 기록
				</ActionSheetButton>
			</div>
		</div>
	);
}

function UnifiedUrgeContent({
	actionLabel,
	remainingMin,
	canCharge,
	onDelay,
	onCoaching,
	onAction,
	isSubmitting,
}: {
	actionLabel: string;
	remainingMin: number;
	canCharge: boolean;
	onDelay: (minutes: number) => void;
	onCoaching: () => void;
	onAction: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-5">
			<div className="text-center">
				<div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15">
					<span className="text-2xl">🧘</span>
				</div>
				<p className="text-sm text-text-secondary">지금은 잠깐만. 기다리면 적립이 늘어요</p>
			</div>

			<div className="flex flex-col gap-2">
				<ActionSheetChipGroup
					label="잠깐만 기다리기"
					chips={DELAY_CHIPS.map((c) => ({ ...c, highlight: true }))}
					onSelect={onDelay}
					disabled={isSubmitting}
				/>
				<p className="text-xs text-text-tertiary text-center">
					{remainingMin > 0 ? (
						<>
							다음 기록까지{" "}
							<span className="font-medium text-text-secondary tabular-nums">{remainingMin}분</span>{" "}
							남았어요
						</>
					) : (
						"이제 기록할 수 있어요"
					)}
				</p>
			</div>

			<div className="flex flex-col gap-2">
				<ActionSheetButton variant="secondary" onClick={onCoaching} disabled={isSubmitting}>
					30초 숨 고르고 결정하기
				</ActionSheetButton>

				<ActionSheetButton variant="ghost" onClick={onAction} loading={isSubmitting}>
					{nowLabel(actionLabel)}
				</ActionSheetButton>

				{canCharge ? (
					<p className="text-xs text-text-tertiary text-center">
						지금 기록하면{" "}
						<span className="font-medium text-text-secondary tabular-nums">{remainingMin}분</span>이
						차감될 수 있어요
					</p>
				) : null}
			</div>
		</div>
	);
}

function GapContent({ onRecover, isSubmitting }: { onRecover: () => void; isSubmitting: boolean }) {
	return (
		<div className="flex flex-col gap-4" role="region" aria-label="복귀 안내">
			<div className="text-center">
				<div
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15"
					aria-hidden="true"
				>
					<span className="text-2xl">👋</span>
				</div>
				<p className="mt-3 text-lg font-medium">준비됐어요</p>
				<p className="mt-1 text-sm text-text-secondary">지금부터 새롭게 기록을 시작할 수 있어요</p>
			</div>
			<ActionSheetButton variant="primary" size="lg" onClick={onRecover} loading={isSubmitting}>
				지금부터 시작하기
			</ActionSheetButton>
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
			<p className="mb-2 text-sm text-text-secondary">
				{isSubmitting ? "기록하는 중..." : "어떤 이유였나요?"}
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
						className={cn(
							"flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition-all",
							"disabled:cursor-not-allowed disabled:opacity-50",
							"dark:bg-white/5 dark:border-white/10",
							selectedReason === reason.code
								? "border-primary bg-primary/10 dark:bg-primary/15 dark:border-primary/30"
								: "border-border bg-surface hover:border-primary/50",
						)}
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
	introTitle,
	introDescription,
	doneTitle,
	doneDescription,
	completeLabel,
	skipLabel,
	onComplete,
	onSkip,
	isSubmitting,
}: {
	introTitle: string;
	introDescription: string;
	doneTitle: string;
	doneDescription: string;
	completeLabel: string;
	skipLabel: string;
	onComplete: () => void;
	onSkip: () => void;
	isSubmitting: boolean;
}) {
	const [seconds, setSeconds] = useState(30);
	const [started, setStarted] = useState(false);

	useEffect(() => {
		if (!started) return;

		const id = setInterval(() => {
			setSeconds((prev) => {
				if (prev <= 1) {
					clearInterval(id);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(id);
	}, [started]);

	const handleStart = () => {
		setSeconds(30);
		setStarted(true);
	};

	if (!started) {
		return (
			<div className="flex flex-col items-center gap-6" role="region" aria-label="호흡">
				<div className="text-center">
					<div
						className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15"
						aria-hidden="true"
					>
						<span className="text-2xl">🧘</span>
					</div>
					<h3 className="mt-3 text-lg font-semibold">{introTitle}</h3>
					<p className="mt-1 text-sm text-text-secondary">{introDescription}</p>
				</div>
				<ActionSheetButton variant="primary" size="lg" onClick={handleStart}>
					시작하기
				</ActionSheetButton>
				<ActionSheetButton variant="ghost" onClick={onSkip} disabled={isSubmitting}>
					{skipLabel}
				</ActionSheetButton>
			</div>
		);
	}

	if (seconds === 0) {
		return (
			<div className="flex flex-col items-center gap-6" role="region" aria-label="호흡 완료">
				<div className="text-center">
					<div
						className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-muted dark:neon-glow-success"
						aria-hidden="true"
					>
						<span className="text-2xl">✓</span>
					</div>
					<h3 className="mt-3 text-lg font-semibold">{doneTitle}</h3>
					<p className="mt-1 text-sm text-text-secondary">{doneDescription}</p>
				</div>
				<ActionSheetButton variant="primary" size="lg" onClick={onComplete}>
					{completeLabel}
				</ActionSheetButton>
				<ActionSheetButton variant="ghost" onClick={onSkip} loading={isSubmitting}>
					{skipLabel}
				</ActionSheetButton>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-6 py-4" role="region" aria-label="호흡 진행">
			<div className="text-center">
				<p
					className="text-6xl font-bold tabular-nums text-primary"
					aria-live="polite"
					aria-atomic="true"
				>
					{seconds}
				</p>
				<p className="mt-2 text-sm text-text-secondary">천천히 호흡하세요</p>
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
		if (!open) setStep("select");
		onOpenChange(open);
	};

	const getTitle = () => {
		if (moduleState.status === "FOCUS_IDLE") return "집중 시작";
		if (mode === "urge") return "집중이 흔들려요";
		return "집중 종료";
	};

	return (
		<ActionSheet open={open} onOpenChange={handleOpenChange} title={getTitle()}>
			<AnimatePresence mode="wait">
				{moduleState.status === "FOCUS_IDLE" && mode === "action" && (
					<motion.div
						key="focus-start"
						variants={drawerContent}
						initial="hidden"
						animate="visible"
						exit="exit"
					>
						<FocusStartContent
							defaultSessionMin={defaultSessionMin}
							onStart={handleStartSession}
							onCancel={() => onOpenChange(false)}
							isSubmitting={isSubmitting}
						/>
					</motion.div>
				)}

				{moduleState.status === "FOCUS_RUNNING" && mode === "action" && (
					<motion.div
						key="focus-end"
						variants={drawerContent}
						initial="hidden"
						animate="visible"
						exit="exit"
					>
						<FocusEndContent
							onEnd={() => handleEndSession("USER_END")}
							onCancel={() => onOpenChange(false)}
							isSubmitting={isSubmitting}
						/>
					</motion.div>
				)}

				{moduleState.status === "FOCUS_RUNNING" && mode === "urge" && step === "select" && (
					<motion.div
						key="focus-urge"
						variants={drawerContent}
						initial="hidden"
						animate="visible"
						exit="exit"
					>
						<FocusUrgeSelectContent
							onCoaching={() => setStep("coaching")}
							onEnd={() => handleEndSession("URGE")}
							onCancel={() => onOpenChange(false)}
							isSubmitting={isSubmitting}
						/>
					</motion.div>
				)}

				{mode === "urge" && step === "coaching" && (
					<motion.div
						key="coaching"
						variants={drawerContent}
						initial="hidden"
						animate="visible"
						exit="exit"
					>
						<CoachingContent
							introTitle="30초 숨 고르기"
							introDescription="잠깐 멈추고 다음 선택을 해요"
							doneTitle="좋아요. 다시 선택해볼까요?"
							doneDescription="연장하거나 종료할 수 있어요"
							completeLabel="연장 옵션 보기"
							skipLabel="다시 선택하기"
							onComplete={() => setStep("extend")}
							onSkip={() => setStep("select")}
							isSubmitting={isSubmitting}
						/>
					</motion.div>
				)}

				{mode === "urge" && step === "extend" && (
					<motion.div
						key="extend"
						variants={drawerContent}
						initial="hidden"
						animate="visible"
						exit="exit"
					>
						<FocusExtendContent
							onExtend={handleExtend}
							onEnd={() => handleEndSession("URGE")}
							isSubmitting={isSubmitting}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</ActionSheet>
	);
}

function FocusStartContent({
	defaultSessionMin,
	onStart,
	onCancel,
	isSubmitting,
}: {
	defaultSessionMin: number;
	onStart: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-4" role="region" aria-label="집중 시작">
			<div className="text-center">
				<div
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-focus/10 dark:bg-focus/15"
					aria-hidden="true"
				>
					<span className="text-2xl">🎯</span>
				</div>
				<h3 className="mt-3 text-lg font-semibold">집중을 시작할까요?</h3>
				<p className="mt-1 text-sm text-text-secondary">{defaultSessionMin}분만 해볼까요</p>
			</div>
			<ActionSheetButton variant="primary" size="lg" onClick={onStart} loading={isSubmitting}>
				{defaultSessionMin}분 시작
			</ActionSheetButton>
			<ActionSheetButton variant="ghost" onClick={onCancel}>
				취소
			</ActionSheetButton>
		</div>
	);
}

function FocusEndContent({
	onEnd,
	onCancel,
	isSubmitting,
}: {
	onEnd: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-4" role="region" aria-label="집중 종료">
			<div className="text-center">
				<div
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface-elevated dark:bg-white/5"
					aria-hidden="true"
				>
					<span className="text-2xl">⏹️</span>
				</div>
				<h3 className="mt-3 text-lg font-semibold">지금 종료할까요?</h3>
				<p className="mt-1 text-sm text-text-secondary">지금까지의 집중 시간이 기록돼요</p>
			</div>
			<ActionSheetButton variant="primary" size="lg" onClick={onEnd} loading={isSubmitting}>
				집중 종료
			</ActionSheetButton>
			<ActionSheetButton variant="ghost" onClick={onCancel}>
				계속하기
			</ActionSheetButton>
		</div>
	);
}

function FocusUrgeSelectContent({
	onCoaching,
	onEnd,
	onCancel,
	isSubmitting,
}: {
	onCoaching: () => void;
	onEnd: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-5" role="region" aria-label="집중 중 선택">
			<div className="text-center">
				<div
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-focus/10 dark:bg-focus/15"
					aria-hidden="true"
				>
					<span className="text-2xl">🤔</span>
				</div>
				<h3 className="mt-3 text-lg font-semibold">어떻게 할까요?</h3>
				<p className="mt-1 text-sm text-text-secondary">잠깐만 숨 고르고 선택해도 좋아요</p>
			</div>

			<div className="flex flex-col gap-2">
				<motion.button
					type="button"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					onClick={onCoaching}
					disabled={isSubmitting}
					className={cn(
						"min-h-14 rounded-xl border px-4 py-4 text-left transition-all",
						"disabled:cursor-not-allowed disabled:opacity-50",
						"border-focus bg-focus/5 dark:bg-focus/10 dark:border-focus/30",
					)}
				>
					<p className="font-medium text-focus">30초 숨 고르고 연장 선택</p>
					<p className="mt-1 text-sm text-text-tertiary">호흡 후 연장 시간을 고를 수 있어요</p>
				</motion.button>

				<motion.button
					type="button"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.03 }}
					onClick={onEnd}
					disabled={isSubmitting}
					className={cn(
						"min-h-14 rounded-xl border px-4 py-4 text-left transition-all",
						"disabled:cursor-not-allowed disabled:opacity-50",
						"border-border bg-surface dark:bg-white/5 dark:border-white/10",
						"hover:border-primary/50",
					)}
				>
					<p className="font-medium">{isSubmitting ? "종료하는 중..." : "지금 종료하기"}</p>
					<p className="mt-1 text-sm text-text-tertiary">지금까지의 시간이 기록됩니다</p>
				</motion.button>
			</div>

			<ActionSheetButton variant="ghost" onClick={onCancel} disabled={isSubmitting}>
				계속 집중하기
			</ActionSheetButton>
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
					className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-muted dark:neon-glow-success"
					aria-hidden="true"
				>
					<span className="text-2xl">✓</span>
				</div>
				<h3 className="mt-3 text-lg font-semibold">몇 분 더 집중할까요?</h3>
				<p className="mt-1 text-sm text-text-secondary">연장한 시간은 집중 기록에 더해져요</p>
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
						className={cn(
							"min-h-14 rounded-xl border px-4 py-4 text-center transition-all",
							"disabled:cursor-not-allowed disabled:opacity-50",
							selectedMinutes === minutes
								? "border-focus bg-focus/20 dark:neon-glow-focus"
								: "border-focus/30 bg-focus/5 dark:bg-focus/10",
						)}
						aria-label={`${minutes}분 연장`}
					>
						<p className="text-2xl font-bold text-focus">+{minutes}분</p>
					</motion.button>
				))}
			</div>

			<ActionSheetButton variant="ghost" onClick={onEnd} loading={isSubmitting}>
				집중 종료
			</ActionSheetButton>
		</div>
	);
}
