import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireAuth } from "../hooks/auth.js";
import {
	createPauseStart,
	createPauseEnd,
	getTodaySummary,
	getWeeklyReport,
} from "../services/pause.js";

const UrgeTypeSchema = z.enum(["SMOKE", "SNS"]);
const TriggerSourceSchema = z.enum(["MANUAL", "WIDGET", "SHORTCUT"]);
const PauseResultSchema = z.enum(["COMPLETED", "GAVE_IN", "CANCELLED"]);

const createPauseStartSchema = z.object({
	urgeType: UrgeTypeSchema,
	pauseDuration: z.number().refine((v) => v === 90 || v === 180, {
		message: "Duration must be 90 or 180 seconds",
	}),
	triggerSource: TriggerSourceSchema.optional(),
	snsAppName: z.string().optional(),
});

const createPauseEndSchema = z.object({
	pauseStartEventId: z.string().uuid(),
	result: PauseResultSchema,
});

export const pauseRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.post("/start", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = createPauseStartSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const event = await createPauseStart(
			userId,
			parsed.data as Parameters<typeof createPauseStart>[1],
		);

		return { success: true, event };
	});

	app.post("/end", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = createPauseEndSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		try {
			const result = await createPauseEnd(userId, parsed.data);
			return { success: true, ...result };
		} catch (error) {
			if (error instanceof Error && error.message === "Pause start event not found") {
				return reply.code(404).send({ success: false, error: error.message });
			}
			throw error;
		}
	});

	app.get("/today", async (request) => {
		const userId = request.session.userId!;
		const summary = await getTodaySummary(userId);

		return { success: true, summary };
	});

	app.get("/week", async (request, reply) => {
		const userId = request.session.userId!;
		const query = request.query as { weekStart?: string };

		if (query.weekStart && !/^\d{4}-\d{2}-\d{2}$/.test(query.weekStart)) {
			return reply
				.code(400)
				.send({ success: false, error: "Invalid weekStart format. Use YYYY-MM-DD" });
		}

		const report = await getWeeklyReport(userId, query.weekStart);

		return { success: true, report };
	});
};
