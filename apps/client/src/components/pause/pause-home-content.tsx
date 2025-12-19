import { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { TodayRecordCard } from "./today-record-card";
import { UrgeButtonGroup } from "./urge-button";
import { TimerSelectDrawer } from "./timer-select-drawer";
import { BreathingTimer } from "./breathing-timer";
import { ResultChoiceScreen, ResultFeedbackScreen } from "./result-choice-screen";
import type {
	PauseTodaySummary,
	PauseUrgeType,
	PauseDuration,
	PauseResult,
	PauseEvent,
} from "@/lib/api-types";

type PauseFlowState =
	| { step: "idle" }
	| { step: "select-timer"; urgeType: PauseUrgeType }
	| {
			step: "timer-running";
			urgeType: PauseUrgeType;
			duration: PauseDuration;
			startEvent: PauseEvent;
	  }
	| {
			step: "choice";
			urgeType: PauseUrgeType;
			duration: PauseDuration;
			startEvent: PauseEvent;
	  }
	| { step: "feedback"; result: PauseResult; summary: PauseTodaySummary };

export function PauseHomeContent() {
	const [summary, setSummary] = useState<PauseTodaySummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [flowState, setFlowState] = useState<PauseFlowState>({ step: "idle" });

	const fetchSummary = useCallback(async () => {
		try {
			const res = await api.pause.today();
			setSummary(res.summary);
		} catch (error) {
			console.error("Failed to fetch summary:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSummary();
	}, [fetchSummary]);

	const handleUrgePress = useCallback((urgeType: PauseUrgeType) => {
		setFlowState({ step: "select-timer", urgeType });
	}, []);

	const handleTimerSelect = useCallback(
		async (duration: PauseDuration) => {
			if (flowState.step !== "select-timer") return;

			try {
				const res = await api.pause.start({
					urgeType: flowState.urgeType,
					pauseDuration: duration,
					triggerSource: "MANUAL",
				});

				setFlowState({
					step: "timer-running",
					urgeType: flowState.urgeType,
					duration,
					startEvent: res.event,
				});
			} catch (error) {
				console.error("Failed to start pause:", error);
				setFlowState({ step: "idle" });
			}
		},
		[flowState],
	);

	const handleTimerComplete = useCallback(() => {
		if (flowState.step !== "timer-running") return;

		setFlowState({
			step: "choice",
			urgeType: flowState.urgeType,
			duration: flowState.duration,
			startEvent: flowState.startEvent,
		});
	}, [flowState]);

	const handleTimerCancel = useCallback(async () => {
		if (flowState.step !== "timer-running") return;

		try {
			await api.pause.end({
				pauseStartEventId: flowState.startEvent.id,
				result: "CANCELLED",
			});
		} catch (error) {
			console.error("Failed to cancel pause:", error);
		}

		setFlowState({ step: "idle" });
		fetchSummary();
	}, [flowState, fetchSummary]);

	const handleChoice = useCallback(
		async (result: PauseResult) => {
			if (flowState.step !== "choice") return;

			try {
				const res = await api.pause.end({
					pauseStartEventId: flowState.startEvent.id,
					result,
				});

				setFlowState({
					step: "feedback",
					result,
					summary: res.summary,
				});
			} catch (error) {
				console.error("Failed to end pause:", error);
				setFlowState({ step: "idle" });
				fetchSummary();
			}
		},
		[flowState, fetchSummary],
	);

	const handleFeedbackClose = useCallback(() => {
		if (flowState.step === "feedback") {
			setSummary(flowState.summary);
		}
		setFlowState({ step: "idle" });
	}, [flowState]);

	const handleDrawerClose = useCallback((open: boolean) => {
		if (!open) {
			setFlowState({ step: "idle" });
		}
	}, []);

	// TODO: 온보딩에서 선택한 모듈 가져오기
	const enabledModules: PauseUrgeType[] = ["SMOKE", "SNS"];

	if (loading || !summary) {
		return <PauseHomeSkeleton />;
	}

	return (
		<>
			<div className="relative flex flex-1 flex-col pb-8 overflow-hidden">
				{/* Background Halos */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/7 blur-3xl"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute top-40 right-6 h-56 w-56 rounded-full bg-success/5 blur-3xl"
				/>

				{/* Header */}
				<header className="px-6 pt-6">
					<p className="text-xs text-text-tertiary">{formatDate(new Date())}</p>
					<h1 className="mt-1 text-lg font-semibold tracking-tight text-text-primary">Pause</h1>
				</header>

				{/* Today Record Card */}
				<motion.section
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="px-6 pt-6"
				>
					<TodayRecordCard summary={summary} />
				</motion.section>

				{/* Urge Buttons */}
				<motion.section
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex-1 flex flex-col justify-center px-6 pt-8"
				>
					<UrgeButtonGroup enabledModules={enabledModules} onPress={handleUrgePress} />
				</motion.section>
			</div>

			{/* Timer Select Drawer */}
			<TimerSelectDrawer
				open={flowState.step === "select-timer"}
				onOpenChange={handleDrawerClose}
				urgeType={flowState.step === "select-timer" ? flowState.urgeType : null}
				onSelect={handleTimerSelect}
			/>

			{/* Breathing Timer */}
			{flowState.step === "timer-running" && (
				<BreathingTimer
					urgeType={flowState.urgeType}
					duration={flowState.duration}
					onComplete={handleTimerComplete}
					onCancel={handleTimerCancel}
				/>
			)}

			{/* Result Choice */}
			{flowState.step === "choice" && (
				<ResultChoiceScreen
					urgeType={flowState.urgeType}
					duration={flowState.duration}
					onChoice={handleChoice}
				/>
			)}

			{/* Result Feedback */}
			{flowState.step === "feedback" && (
				<ResultFeedbackScreen
					result={flowState.result}
					successCount={flowState.summary.pauseCompleted}
					streak={flowState.summary.currentStreak}
					onClose={handleFeedbackClose}
				/>
			)}
		</>
	);
}

function PauseHomeSkeleton() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="px-6 pt-6">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="mt-2 h-6 w-16" />
			</div>
			<div className="px-6 pt-6">
				<Skeleton className="h-32 w-full rounded-2xl" />
			</div>
			<div className="flex-1 flex flex-col justify-center px-6 pt-8">
				<Skeleton className="h-5 w-32 mx-auto mb-3" />
				<div className="flex gap-3">
					<Skeleton className="flex-1 h-32 rounded-2xl" />
					<Skeleton className="flex-1 h-32 rounded-2xl" />
				</div>
			</div>
		</div>
	);
}
