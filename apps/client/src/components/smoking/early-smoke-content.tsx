import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { EarlyLightContent } from "./early-light-content";
import { EarlyCoachingContent } from "./early-coaching-content";
import type { TodaySummary } from "@/types/home.type";

interface EarlySmokeContentProps {
	summary: TodaySummary;
	onComplete: () => void;
}

type Mode = "SELECT" | "LIGHT" | "COACHING";

export function EarlySmokeContent({ summary, onComplete }: EarlySmokeContentProps) {
	const [mode, setMode] = useState<Mode>("SELECT");

	const remainingMinutes = summary.lastSmokedAt
		? Math.max(
				0,
				summary.targetInterval -
					Math.round((Date.now() - new Date(summary.lastSmokedAt).getTime()) / 1000 / 60),
			)
		: 0;

	if (mode === "LIGHT") {
		return <EarlyLightContent summary={summary} onComplete={onComplete} />;
	}

	if (mode === "COACHING") {
		return (
			<EarlyCoachingContent
				summary={summary}
				remainingMinutes={remainingMinutes}
				onComplete={onComplete}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6 px-4">
			<div className="text-center">
				<p className="text-4xl">👀</p>
				<h3 className="mt-2 text-lg font-semibold">아직 목표 시간보다 조금 이른데요</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					목표까지 <span className="font-medium text-foreground">{remainingMinutes}분</span>{" "}
					남았어요
				</p>
			</div>
			<div className="flex flex-col gap-3">
				<motion.button
					type="button"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.03 }}
					onClick={() => setMode("LIGHT")}
					className="rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/50"
				>
					<p className="font-medium">시간만 빨리 기록하기</p>
					<p className="mt-1 text-sm text-muted-foreground">바쁠 때, 간단하게</p>
				</motion.button>
				<motion.button
					type="button"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.06 }}
					onClick={() => setMode("COACHING")}
					className="rounded-xl border border-primary bg-primary/5 px-4 py-4 text-left transition-colors"
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
