import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import { toUserDto } from "../mappers/user.js";

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
		await request.session.save();

		return { success: true, user: toUserDto(newUser) };
	});

	app.post("/logout", async (request) => {
		request.session.destroy();
		return { success: true };
	});
};
