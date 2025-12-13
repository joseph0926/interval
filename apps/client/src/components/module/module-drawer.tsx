import { useState } from "react";
import { motion } from "motion/react";
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
import { MODULE_CONFIGS } from "@/types/engine.type";
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

export function ModuleDrawer({
	open,
	onOpenChange,
	moduleState,
	mode,
	onComplete,
}: ModuleDrawerProps) {
	const config = MODULE_CONFIGS[moduleState.moduleType];
	const [step, setStep] = useState<"select" | "reason" | "coaching" | "delay">("select");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleAction = async (reasonLabel?: EngineReasonLabel) => {
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
	};

	const handleDelay = async (minutes: 1 | 3 | 5 | 10) => {
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
	};

	const handleGapRecovery = async () => {
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
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setStep("select");
		}
		onOpenChange(open);
	};

	const getTitle = () => {
		if (mode === "gap") return "복귀하기";
		if (mode === "urge") return "충동 관리";
		if (moduleState.status === "NO_BASELINE") return `오늘 첫 ${config.label}`;
		return `${config.label} 기록`;
	};

	return (
		<Drawer open={open} onOpenChange={handleOpenChange}>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>{getTitle()}</DrawerTitle>
					<DrawerDescription className="sr-only">
						{config.label} 기록을 입력하세요
					</DrawerDescription>
				</DrawerHeader>

				<div className="px-4 pb-4">
					{mode === "gap" && (
						<GapContent onRecover={handleGapRecovery} isSubmitting={isSubmitting} />
					)}

					{mode === "action" && step === "select" && (
						<ActionSelectContent
							onQuickAction={() => handleAction()}
							onWithReason={() => setStep("reason")}
							isSubmitting={isSubmitting}
						/>
					)}

					{mode === "action" && step === "reason" && (
						<ReasonSelectContent
							onSelect={(reason) => handleAction(reason)}
							onBack={() => setStep("select")}
							isSubmitting={isSubmitting}
						/>
					)}

					{mode === "urge" && step === "select" && (
						<UrgeSelectContent
							remainingMin={moduleState.remainingMin ?? 0}
							onLightAction={() => handleAction()}
							onCoaching={() => setStep("coaching")}
							isSubmitting={isSubmitting}
						/>
					)}

					{mode === "urge" && step === "coaching" && (
						<CoachingContent
							onComplete={() => setStep("delay")}
							onSkip={() => handleAction()}
							isSubmitting={isSubmitting}
						/>
					)}

					{mode === "urge" && step === "delay" && (
						<DelaySelectContent
							onSelect={handleDelay}
							onSkip={() => handleAction()}
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
		<div className="flex flex-col gap-4">
			<div className="text-center">
				<p className="text-4xl">👋</p>
				<p className="mt-2 text-lg font-medium">오랜만이에요!</p>
				<p className="text-sm text-muted-foreground">
					마지막 기록으로부터 오래 지났어요. 지금부터 다시 시작할까요?
				</p>
			</div>
			<Button onClick={onRecover} disabled={isSubmitting} className="w-full">
				{isSubmitting ? "처리 중..." : "지금부터 다시 시작"}
			</Button>
		</div>
	);
}

function ActionSelectContent({
	onQuickAction,
	onWithReason,
	isSubmitting,
}: {
	onQuickAction: () => void;
	onWithReason: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-3">
			<motion.button
				type="button"
				initial={{ opacity: 0, y: 5 }}
				animate={{ opacity: 1, y: 0 }}
				onClick={onQuickAction}
				disabled={isSubmitting}
				className="rounded-xl border border-primary bg-primary/5 px-4 py-4 text-left transition-colors disabled:opacity-50"
			>
				<p className="font-medium text-primary">빠르게 기록하기</p>
				<p className="mt-1 text-sm text-muted-foreground">시간만 기록해요</p>
			</motion.button>
			<motion.button
				type="button"
				initial={{ opacity: 0, y: 5 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.03 }}
				onClick={onWithReason}
				disabled={isSubmitting}
				className="rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/50 disabled:opacity-50"
			>
				<p className="font-medium">이유와 함께 기록하기</p>
				<p className="mt-1 text-sm text-muted-foreground">패턴 분석에 도움이 돼요</p>
			</motion.button>
			<DrawerFooter className="px-0">
				<DrawerClose asChild>
					<Button variant="ghost" className="w-full">
						취소
					</Button>
				</DrawerClose>
			</DrawerFooter>
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
	return (
		<div className="flex flex-col gap-3">
			<p className="mb-2 text-sm text-muted-foreground">왜 지금 하게 됐나요?</p>
			<div className="grid grid-cols-2 gap-2">
				{REASON_OPTIONS.map((reason, idx) => (
					<motion.button
						key={reason.code}
						type="button"
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: idx * 0.02 }}
						onClick={() => onSelect(reason.code)}
						disabled={isSubmitting}
						className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50 disabled:opacity-50"
					>
						<span>{reason.emoji}</span>
						<span className="text-sm">{reason.label}</span>
					</motion.button>
				))}
			</div>
			<Button variant="ghost" onClick={onBack} className="mt-2">
				뒤로
			</Button>
		</div>
	);
}

function UrgeSelectContent({
	remainingMin,
	onLightAction,
	onCoaching,
	isSubmitting,
}: {
	remainingMin: number;
	onLightAction: () => void;
	onCoaching: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-6">
			<div className="text-center">
				<p className="text-4xl">👀</p>
				<h3 className="mt-2 text-lg font-semibold">아직 목표 시간보다 조금 이른데요</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					목표까지 <span className="font-medium text-foreground">{remainingMin}분</span> 남았어요
				</p>
			</div>
			<div className="flex flex-col gap-3">
				<motion.button
					type="button"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.03 }}
					onClick={onLightAction}
					disabled={isSubmitting}
					className="rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/50 disabled:opacity-50"
				>
					<p className="font-medium">시간만 빨리 기록하기</p>
					<p className="mt-1 text-sm text-muted-foreground">바쁠 때, 간단하게</p>
				</motion.button>
				<motion.button
					type="button"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.06 }}
					onClick={onCoaching}
					disabled={isSubmitting}
					className="rounded-xl border border-primary bg-primary/5 px-4 py-4 text-left transition-colors disabled:opacity-50"
				>
					<p className="font-medium text-primary">30초만 멈춰보고 기록하기</p>
					<p className="mt-1 text-sm text-muted-foreground">잠깐 호흡하고 결정해요</p>
				</motion.button>
			</div>
			<DrawerFooter className="px-0">
				<DrawerClose asChild>
					<Button variant="ghost" className="w-full">
						취소
					</Button>
				</DrawerClose>
			</DrawerFooter>
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
			<div className="flex flex-col items-center gap-6">
				<div className="text-center">
					<p className="text-4xl">🧘</p>
					<h3 className="mt-2 text-lg font-semibold">30초 호흡하기</h3>
					<p className="mt-1 text-sm text-muted-foreground">잠깐 멈추고 호흡에 집중해보세요</p>
				</div>
				<Button onClick={handleStart} className="w-full">
					시작하기
				</Button>
				<Button variant="ghost" onClick={onSkip} disabled={isSubmitting}>
					건너뛰고 기록하기
				</Button>
			</div>
		);
	}

	if (seconds === 0) {
		return (
			<div className="flex flex-col items-center gap-6">
				<div className="text-center">
					<p className="text-4xl">🎉</p>
					<h3 className="mt-2 text-lg font-semibold">잘했어요!</h3>
					<p className="mt-1 text-sm text-muted-foreground">조금 더 미뤄볼까요?</p>
				</div>
				<Button onClick={onComplete} className="w-full">
					미루기 옵션 보기
				</Button>
				<Button variant="ghost" onClick={onSkip} disabled={isSubmitting}>
					그래도 지금 할래요
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-6">
			<div className="text-center">
				<p className="text-6xl font-bold tabular-nums">{seconds}</p>
				<p className="mt-2 text-sm text-muted-foreground">천천히 호흡하세요</p>
			</div>
		</div>
	);
}

function DelaySelectContent({
	onSelect,
	onSkip,
	isSubmitting,
}: {
	onSelect: (minutes: 1 | 3 | 5 | 10) => void;
	onSkip: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="flex flex-col gap-4">
			<p className="text-center text-sm text-muted-foreground">얼마나 미뤄볼까요?</p>
			<div className="grid grid-cols-2 gap-2">
				{DELAY_OPTIONS.map((minutes, idx) => (
					<motion.button
						key={minutes}
						type="button"
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: idx * 0.02 }}
						onClick={() => onSelect(minutes)}
						disabled={isSubmitting}
						className="rounded-xl border border-primary bg-primary/5 px-4 py-4 text-center transition-colors disabled:opacity-50"
					>
						<p className="text-2xl font-bold text-primary">{minutes}분</p>
					</motion.button>
				))}
			</div>
			<Button variant="ghost" onClick={onSkip} disabled={isSubmitting} className="mt-2">
				그래도 지금 할래요
			</Button>
		</div>
	);
}
