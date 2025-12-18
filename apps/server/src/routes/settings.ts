import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../hooks/auth.js";
import { toUserSettings } from "../mappers/user.js";

const updateSettingsSchema = z.object({
	nickname: z.string().min(1).max(20).optional(),
	dayAnchorMinutes: z.number().int().min(0).max(1440).optional(),
	notificationsEnabled: z.boolean().optional(),
	dailyReminderEnabled: z.boolean().optional(),
	dailyReminderTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional()
		.nullable(),
});

export const settingsRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.get("/", async (request, reply) => {
		const userId = request.session.userId!;

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return reply.code(404).send({ success: false, error: "User not found" });
		}

		return { success: true, settings: toUserSettings(user) };
	});

	app.patch("/", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = updateSettingsSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const user = await prisma.user.update({
			where: { id: userId },
			data: parsed.data,
		});

		return { success: true, settings: toUserSettings(user) };
	});
};
