import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getTodaySummary, recordSmoking, addDelay, softReset } from "../services/smoking.js";

const recordSchema = z.object({
	smokedAt: z.string(),
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

const softResetSchema = z.object({});

export const smokingRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", async (request, reply) => {
		if (!request.session.userId) {
			reply.code(401).send({ success: false, error: "Unauthorized" });
		}
	});

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

	app.post("/soft-reset", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = softResetSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const result = await softReset(userId);
		return { success: true, ...result };
	});
};
