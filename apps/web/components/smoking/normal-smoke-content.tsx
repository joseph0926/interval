"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { ReasonSelector } from "./reason-selector";
import { recordSmoking } from "@/actions/smoking";
import { toast } from "sonner";
import { notifySmokingRecorded } from "@/lib/native-bridge";
import type { TodaySummary } from "@/types/home.type";
import type { ReasonCode } from "@/prisma/generated/prisma/enums";

interface NormalSmokeContentProps {
	summary: TodaySummary;
	onComplete: () => void;
}

export function NormalSmokeContent({ summary, onComplete }: NormalSmokeContentProps) {
	const [reasonCode, setReasonCode] = useState<ReasonCode | null>(null);
	const [customReason, setCustomReason] = useState("");
	const [isPending, setIsPending] = useState(false);

	const currentInterval = summary.lastSmokedAt
		? // eslint-disable-next-line
			Math.round((Date.now() - summary.lastSmokedAt.getTime()) / 1000 / 60)
		: 0;

	const handleSubmit = async () => {
		if (!reasonCode) {
			toast.error("이유를 선택해주세요");
			return;
		}

		setIsPending(true);

		const result = await recordSmoking({
			type: "NORMAL",
			reasonCode,
			reasonText: reasonCode === "OTHER" ? customReason : null,
		});

		setIsPending(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		const nextTargetTime = new Date(Date.now() + summary.targetInterval * 60 * 1000);
		notifySmokingRecorded(nextTargetTime, summary.motivation ?? undefined);

		toast.success(`좋아요! 담배와 ${currentInterval}분의 거리를 벌렸어요.`, {
			description: "목표를 지켰어요 👏",
		});

		onComplete();
	};

	return (
		<div className="flex flex-col gap-6 px-4">
			<div className="text-center">
				<p className="text-4xl">👏</p>
				<h3 className="mt-2 text-lg font-semibold">목표 시간 이후에 피웠어요!</h3>
				<div className="mt-4 flex justify-center gap-6">
					<div className="text-center">
						<p className="text-2xl font-bold text-primary">{currentInterval}분</p>
						<p className="text-xs text-muted-foreground">이번 간격</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold">{summary.averageInterval ?? "-"}분</p>
						<p className="text-xs text-muted-foreground">오늘 평균</p>
					</div>
				</div>
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
					onClick={handleSubmit}
					disabled={isPending || !reasonCode}
				>
					{isPending ? "기록 중..." : "기록하기"}
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
