import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../hooks/auth.js";
import { toSettings } from "../mappers/user.js";

const updateSettingsSchema = z.object({
	nickname: z.string().min(1).max(20).optional(),
	currentTargetInterval: z.number().int().min(1).max(480).optional(),
	currentMotivation: z.string().max(200).optional().nullable(),
	dayStartTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional(),
	notifyOnTargetTime: z.boolean().optional(),
	notifyMorningDelay: z.boolean().optional(),
	notifyDailyReminder: z.boolean().optional(),
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

		return { success: true, settings: toSettings(user) };
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

		return { success: true, settings: toSettings(user) };
	});
};
