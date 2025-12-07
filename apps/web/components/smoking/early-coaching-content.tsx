"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { ReasonSelector } from "./reason-selector";
import { CoachingTimer } from "./coaching-timer";
import { recordSmoking } from "@/actions/smoking";
import { addDelay } from "@/actions/smoking";
import { toast } from "sonner";
import { notifySmokingRecorded, scheduleDelayNotification } from "@/lib/native-bridge";
import type { TodaySummary } from "@/types/home.type";
import type { ReasonCode } from "@/prisma/generated/prisma/enums";

interface EarlyCoachingContentProps {
	summary: TodaySummary;
	remainingMinutes: number;
	onComplete: () => void;
}

type Step = "REASON" | "REFLECTION" | "TIMER" | "DECISION";

export function EarlyCoachingContent({
	summary,
	remainingMinutes,
	onComplete,
}: EarlyCoachingContentProps) {
	const [step, setStep] = useState<Step>("REASON");
	const [reasonCode, setReasonCode] = useState<ReasonCode | null>(null);
	const [customReason, setCustomReason] = useState("");
	const [emotionNote, setEmotionNote] = useState("");
	const [isPending, setIsPending] = useState(false);

	const handleReasonNext = () => {
		if (!reasonCode) {
			toast.error("이유를 선택해주세요");
			return;
		}
		setStep("REFLECTION");
	};

	const handleReflectionNext = () => {
		setStep("TIMER");
	};

	const handleTimerComplete = () => {
		setStep("DECISION");
	};

	const handleDelay = async () => {
		setIsPending(true);

		const result = await addDelay({ minutes: 5 });

		setIsPending(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		const delayEndTime = new Date(Date.now() + 5 * 60 * 1000);
		scheduleDelayNotification(delayEndTime);

		toast.success("대단해요! 담배와 5분의 거리를 더 벌렸어요.", {
			description: "조금만 더 버텨봐요 💪",
		});

		onComplete();
	};

	const handleSmokeNow = async () => {
		setIsPending(true);

		const result = await recordSmoking({
			type: "EARLY",
			reasonCode,
			reasonText: reasonCode === "OTHER" ? customReason : null,
			coachingMode: "FULL",
			emotionNote: emotionNote || null,
		});

		setIsPending(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		const nextTargetTime = new Date(Date.now() + summary.targetInterval * 60 * 1000);
		notifySmokingRecorded(nextTargetTime, summary.motivation ?? undefined);

		toast("오늘은 여기까지가 한계였던 것 같아요.", {
			description: "덕분에 언제, 왜 힘든지 데이터를 하나 더 알았어요.",
		});

		onComplete();
	};

	return (
		<div className="flex flex-col gap-6 px-4">
			<AnimatePresence mode="wait">
				{step === "REASON" && (
					<motion.div
						key="reason"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						className="flex flex-col gap-6"
					>
						<div>
							<h3 className="text-lg font-semibold">지금 담배가 당기는 이유를 골라볼까요?</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								목표까지 {remainingMinutes}분 남았어요
							</p>
						</div>
						<ReasonSelector
							value={reasonCode}
							customReason={customReason}
							onChange={setReasonCode}
							onCustomReasonChange={setCustomReason}
						/>
						<DrawerFooter className="px-0">
							<Button
								size="lg"
								className="w-full rounded-xl py-6"
								onClick={handleReasonNext}
								disabled={!reasonCode}
							>
								다음
							</Button>
							<DrawerClose asChild>
								<Button variant="ghost" className="w-full">
									취소
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</motion.div>
				)}
				{step === "REFLECTION" && (
					<motion.div
						key="reflection"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						className="flex flex-col gap-6"
					>
						<div>
							<h3 className="text-lg font-semibold">지금 피우면 나에게 어떤 도움이 될까요?</h3>
							<p className="mt-1 text-sm text-muted-foreground">솔직하게 적어봐요</p>
						</div>
						<Textarea
							value={emotionNote}
							onChange={(e) => setEmotionNote(e.target.value)}
							placeholder="스트레스가 풀릴 것 같아요..."
							className="min-h-24 resize-none rounded-xl"
						/>
						<DrawerFooter className="px-0">
							<Button size="lg" className="w-full rounded-xl py-6" onClick={handleReflectionNext}>
								30초 멈춰보기
							</Button>
							<DrawerClose asChild>
								<Button variant="ghost" className="w-full">
									취소
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</motion.div>
				)}
				{step === "TIMER" && (
					<motion.div
						key="timer"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="flex flex-col gap-6"
					>
						<CoachingTimer duration={30} onComplete={handleTimerComplete} />
					</motion.div>
				)}
				{step === "DECISION" && (
					<motion.div
						key="decision"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						className="flex flex-col gap-6"
					>
						<div className="text-center">
							<p className="text-4xl">🤔</p>
							<h3 className="mt-2 text-lg font-semibold">어떻게 할까요?</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								지금 피울지, 조금 있다가 피울지 선택해요
							</p>
						</div>
						<div className="rounded-xl bg-muted/50 p-4">
							<p className="text-sm text-muted-foreground">
								{summary.motivation
									? `"${summary.motivation}"`
									: "담배와의 거리를 조금씩 벌려보는 중이에요."}
							</p>
						</div>
						<DrawerFooter className="px-0">
							<Button
								size="lg"
								className="w-full rounded-xl py-6"
								onClick={handleDelay}
								disabled={isPending}
							>
								{isPending ? "처리 중..." : "5분만 더 미뤄볼게요"}
							</Button>
							<Button
								variant="ghost"
								className="w-full"
								onClick={handleSmokeNow}
								disabled={isPending}
							>
								그래도 지금 피울게요
							</Button>
						</DrawerFooter>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
