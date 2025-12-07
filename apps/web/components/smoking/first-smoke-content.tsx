"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { recordSmoking, updateTodaySettings } from "@/actions/smoking";
import { toast } from "sonner";
import { notifySmokingRecorded } from "@/lib/native-bridge";
import type { TodaySummary } from "@/types/home.type";

interface FirstSmokeContentProps {
	summary: TodaySummary;
	onComplete: () => void;
}

export function FirstSmokeContent({ summary, onComplete }: FirstSmokeContentProps) {
	const [targetInterval, setTargetInterval] = useState(summary.targetInterval);
	const [motivation, setMotivation] = useState(summary.motivation ?? "");
	const [isPending, setIsPending] = useState(false);

	const handleSubmit = async () => {
		setIsPending(true);

		const [settingsResult, recordResult] = await Promise.all([
			updateTodaySettings({ targetInterval, motivation }),
			recordSmoking({ type: "FIRST" }),
		]);

		setIsPending(false);

		if (!settingsResult.success || !recordResult.success) {
			toast.error(settingsResult.error ?? recordResult.error);
			return;
		}

		const nextTargetTime = new Date(Date.now() + targetInterval * 60 * 1000);
		notifySmokingRecorded(nextTargetTime, motivation);

		toast.success("오늘의 간격 여정이 시작됐어요!", {
			description: `목표 간격 ${targetInterval}분으로 함께 해볼게요.`,
		});

		onComplete();
	};

	return (
		<div className="flex flex-col gap-6 px-4">
			<div>
				<h3 className="text-lg font-semibold">오늘 목표 간격</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					오늘은 이 간격으로 담배와 거리를 벌려볼까요?
				</p>
				<div className="mt-6 flex flex-col items-center">
					<div className="text-5xl font-bold tabular-nums">
						{targetInterval}
						<span className="text-xl font-medium text-muted-foreground ml-1">분</span>
					</div>
					<div className="mt-6 w-full">
						<Slider
							value={[targetInterval]}
							onValueChange={(v) => setTargetInterval(v[0])}
							min={30}
							max={120}
							step={5}
						/>
						<div className="mt-2 flex justify-between text-xs text-muted-foreground">
							<span>30분</span>
							<span>120분</span>
						</div>
					</div>
				</div>
			</div>
			<div>
				<h3 className="text-lg font-semibold">오늘의 이유</h3>
				<p className="mt-1 text-sm text-muted-foreground">힘들 때 다시 보여드릴게요.</p>
				<Textarea
					value={motivation}
					onChange={(e) => setMotivation(e.target.value)}
					placeholder="기침이 너무 심해서 조금 줄이고 싶어요."
					className="mt-3 min-h-20 resize-none rounded-xl"
				/>
			</div>
			<DrawerFooter className="px-0">
				<Button
					size="lg"
					className="w-full rounded-xl py-6"
					onClick={handleSubmit}
					disabled={isPending}
				>
					{isPending ? "잠시만요..." : "오늘은 이 간격으로 해볼게요"}
				</Button>
				<DrawerClose asChild>
					<Button variant="ghost" className="w-full">
						취소
					</Button>
				</DrawerClose>
			</DrawerFooter>
		</div>
	);
}
