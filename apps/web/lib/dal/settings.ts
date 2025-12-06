import { cache } from "react";
import { prisma } from "../db";
import type { UserSettings } from "@/types/settings.type";

export const getUserSettings = cache(async (userId: string): Promise<UserSettings> => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			currentTargetInterval: true,
			currentMotivation: true,
			dailySmokingRange: true,
			isGuest: true,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	return {
		targetInterval: user.currentTargetInterval,
		motivation: user.currentMotivation,
		dailySmokingRange: user.dailySmokingRange,
		isGuest: user.isGuest,
		notificationEnabled: false,
		morningReminderEnabled: false,
	};
});
