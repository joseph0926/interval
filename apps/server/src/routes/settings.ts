import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { Settings, DailySmokingRange } from "../types/index.js";

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

function toSettings(user: {
	nickname: string | null;
	dailySmokingRange: string | null;
	dayStartTime: string;
	currentTargetInterval: number;
	currentMotivation: string | null;
	notifyOnTargetTime: boolean;
	notifyMorningDelay: boolean;
	notifyDailyReminder: boolean;
}): Settings {
	return {
		nickname: user.nickname,
		dailySmokingRange: user.dailySmokingRange as DailySmokingRange | null,
		dayStartTime: user.dayStartTime,
		currentTargetInterval: user.currentTargetInterval,
		currentMotivation: user.currentMotivation,
		notifyOnTargetTime: user.notifyOnTargetTime,
		notifyMorningDelay: user.notifyMorningDelay,
		notifyDailyReminder: user.notifyDailyReminder,
	};
}

export const settingsRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", async (request, reply) => {
		if (!request.session.userId) {
			reply.code(401).send({ success: false, error: "Unauthorized" });
		}
	});

	app.get("/", async (request) => {
		const userId = request.session.userId!;

		const user = await prisma.user.findUniqueOrThrow({
			where: { id: userId },
		});

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
