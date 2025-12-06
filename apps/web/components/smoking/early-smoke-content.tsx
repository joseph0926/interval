"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { ReasonSelector } from "./reason-selector";
import { recordSmoking } from "@/actions/smoking";
import { toast } from "sonner";
import type { TodaySummary } from "@/types/home.type";
import type { ReasonCode } from "@/prisma/generated/prisma/enums";

interface EarlySmokeContentProps {
	summary: TodaySummary;
	onComplete: () => void;
}

export function EarlySmokeContent({ summary, onComplete }: EarlySmokeContentProps) {
	const [reasonCode, setReasonCode] = useState<ReasonCode | null>(null);
	const [customReason, setCustomReason] = useState("");
	const [isPending, setIsPending] = useState(false);

	const remainingMinutes = summary.lastSmokedAt
		? Math.max(
				0,
				summary.targetInterval -
					// eslint-disable-next-line
					Math.round((Date.now() - summary.lastSmokedAt.getTime()) / 1000 / 60),
			)
		: 0;

	const handleSubmit = async () => {
		if (!reasonCode) {
			toast.error("이유를 선택해주세요");
			return;
		}

		setIsPending(true);

		const result = await recordSmoking({
			type: "EARLY",
			reasonCode,
			reasonText: reasonCode === "OTHER" ? customReason : null,
			coachingMode: "LIGHT",
		});

		setIsPending(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		toast("이 시간대가 특히 힘든 구간이에요.", {
			description: "내일 리포트에서 이 패턴을 다시 보여드릴게요.",
		});

		onComplete();
	};

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
			<div className="rounded-xl bg-muted/50 p-4">
				<p className="text-sm text-muted-foreground">
					괜찮아요. 오늘 이 시간에 당기곤 한다는 걸 알게 되었어요.
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
					onClick={handleSubmit}
					disabled={isPending || !reasonCode}
				>
					{isPending ? "기록 중..." : "시간만 빨리 기록하기"}
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
