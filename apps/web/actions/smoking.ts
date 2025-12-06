"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import type { ReasonCode, RecordType, CoachingMode } from "@/prisma/generated/prisma/enums";

export interface RecordSmokingInput {
	type: RecordType;
	reasonCode?: ReasonCode | null;
	reasonText?: string | null;
	coachingMode?: CoachingMode;
	delayedMinutes?: number;
	smokedAt?: Date;
}

export interface RecordSmokingResult {
	success: boolean;
	error?: string;
	data?: {
		intervalFromPrevious: number | null;
		wasOnTarget: boolean;
		totalDelayMinutes: number;
	};
}

export async function recordSmoking(input: RecordSmokingInput): Promise<RecordSmokingResult> {
	try {
		const user = await requireUser();
		const now = input.smokedAt ?? new Date();

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const lastRecord = await prisma.smokingRecord.findFirst({
			where: {
				userId: user.id,
				smokedAt: { gte: today, lt: tomorrow },
			},
			orderBy: { smokedAt: "desc" },
		});

		let intervalFromPrevious: number | null = null;
		let wasOnTarget = false;

		if (lastRecord) {
			const diffMs = now.getTime() - lastRecord.smokedAt.getTime();
			intervalFromPrevious = Math.round(diffMs / 1000 / 60);
			wasOnTarget = intervalFromPrevious >= user.currentTargetInterval;
		}

		await prisma.smokingRecord.create({
			data: {
				userId: user.id,
				smokedAt: now,
				type: input.type,
				reasonCode: input.reasonCode,
				reasonText: input.reasonText,
				coachingMode: input.coachingMode ?? "NONE",
				delayedMinutes: input.delayedMinutes ?? 0,
				intervalFromPrevious,
				targetIntervalAtTime: user.currentTargetInterval,
				wasOnTarget,
			},
		});

		const allTodayRecords = await prisma.smokingRecord.findMany({
			where: {
				userId: user.id,
				smokedAt: { gte: today, lt: tomorrow },
			},
		});

		const totalDelayMinutes = allTodayRecords.reduce((sum, r) => sum + r.delayedMinutes, 0);

		revalidatePath("/");

		return {
			success: true,
			data: {
				intervalFromPrevious,
				wasOnTarget,
				totalDelayMinutes,
			},
		};
	} catch (error) {
		console.error("Failed to record smoking:", error);
		return {
			success: false,
			error: "기록에 실패했습니다. 다시 시도해주세요.",
		};
	}
}

export async function updateTodaySettings(input: {
	targetInterval: number;
	motivation?: string;
}): Promise<{ success: boolean; error?: string }> {
	try {
		const user = await requireUser();

		await prisma.user.update({
			where: { id: user.id },
			data: {
				currentTargetInterval: input.targetInterval,
				currentMotivation: input.motivation,
			},
		});

		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Failed to update settings:", error);
		return { success: false, error: "설정 변경에 실패했습니다." };
	}
}
