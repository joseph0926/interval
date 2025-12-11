import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import type { UserDto } from "../types/index.js";

function toUserDto(user: {
	id: string;
	isGuest: boolean;
	nickname: string | null;
	email: string | null;
	dailySmokingRange: string | null;
	dayStartTime: string;
	currentTargetInterval: number;
	currentMotivation: string | null;
}): UserDto {
	return {
		id: user.id,
		isGuest: user.isGuest,
		nickname: user.nickname,
		email: user.email,
		dailySmokingRange: user.dailySmokingRange as UserDto["dailySmokingRange"],
		dayStartTime: user.dayStartTime,
		currentTargetInterval: user.currentTargetInterval,
		currentMotivation: user.currentMotivation,
	};
}

export const authRoutes: FastifyPluginAsync = async (app) => {
	app.get("/me", async (request) => {
		const userId = request.session.userId;

		if (!userId) {
			return { success: true, user: null };
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			request.session.userId = undefined;
			return { success: true, user: null };
		}

		return { success: true, user: toUserDto(user) };
	});

	app.post("/guest", async (request) => {
		const existingUserId = request.session.userId;

		if (existingUserId) {
			const existingUser = await prisma.user.findUnique({
				where: { id: existingUserId },
			});

			if (existingUser) {
				return { success: true, user: toUserDto(existingUser) };
			}
		}

		const newUser = await prisma.user.create({
			data: {
				isGuest: true,
			},
		});

		request.session.userId = newUser.id;

		return { success: true, user: toUserDto(newUser) };
	});

	app.post("/logout", async (request) => {
		request.session.destroy();
		return { success: true };
	});
};
