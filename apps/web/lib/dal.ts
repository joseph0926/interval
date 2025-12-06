import { cache } from "react";
import { prisma } from "./db";
import { getSessionUserId } from "./session";

export const getCurrentUser = cache(async () => {
	const userId = await getSessionUserId();

	if (!userId) {
		return null;
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	return user;
});

export const requireUser = cache(async () => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return user;
});
