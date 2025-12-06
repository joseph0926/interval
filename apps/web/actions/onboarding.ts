"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setSessionUserId } from "@/lib/session";
import { completeOnboardingSchema } from "@/lib/validations/onboarding";

export type OnboardingActionState = {
	success: boolean;
	error?: string;
};

export async function completeOnboarding(
	_prevState: OnboardingActionState | null,
	formData: FormData,
): Promise<OnboardingActionState> {
	const raw = {
		dailySmokingRange: formData.get("dailySmokingRange"),
		targetInterval: Number(formData.get("targetInterval")),
		motivation: formData.get("motivation") ?? "",
	};

	const result = completeOnboardingSchema.safeParse(raw);

	if (!result.success) {
		return {
			success: false,
			error: result.error?.message ?? "유효하지 않은 입력입니다.",
		};
	}

	const { dailySmokingRange, targetInterval, motivation } = result.data;

	const user = await prisma.user.create({
		data: {
			isGuest: true,
			dailySmokingRange,
			currentTargetInterval: targetInterval,
			currentMotivation: motivation || null,
		},
	});

	await setSessionUserId(user.id);

	redirect("/");
}
