import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireAuth } from "../hooks/auth.js";
import { getTodaySummary, recordSmoking, addDelay, softReset } from "../services/smoking.js";

const recordSchema = z.object({
	smokedAt: z.string().datetime({ message: "유효한 ISO 8601 날짜 형식이 필요합니다" }),
	type: z.enum(["FIRST", "NORMAL", "EARLY"]),
	reasonCode: z
		.enum(["BREAK_TIME", "STRESS", "HABIT", "BORED", "SOCIAL", "AFTER_MEAL", "OTHER"])
		.optional(),
	reasonText: z.string().optional(),
	coachingMode: z.enum(["NONE", "LIGHT", "FULL"]).optional(),
	emotionNote: z.string().optional(),
	delayedMinutes: z.number().int().min(0).optional(),
});

const delaySchema = z.object({
	minutes: z.number().int().min(1),
});

export const smokingRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.get("/today", async (request) => {
		const userId = request.session.userId!;
		const data = await getTodaySummary(userId);
		return { success: true, data };
	});

	app.post("/record", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = recordSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const result = await recordSmoking(userId, parsed.data);
		return { success: true, ...result };
	});

	app.post("/delay", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = delaySchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const result = await addDelay(userId, parsed.data.minutes);
		return { success: true, ...result };
	});

	app.post("/soft-reset", async (request) => {
		const userId = request.session.userId!;
		const result = await softReset(userId);
		return { success: true, ...result };
	});
};
