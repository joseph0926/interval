import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireAuth } from "../hooks/auth.js";
import {
	getEngineTodaySummary,
	getEngineWeeklyReport,
	createActionEvent,
	createDelayEvent,
	createAdjustmentEvent,
	getModuleSettings,
	updateModuleSettings,
} from "../services/engine.js";
import {
	ModuleTypeSchema,
	ReasonLabelSchema,
	ActionKindSchema,
	TriggerContextSchema,
	AdjustmentKindSchema,
	validateTimestampNotTooFarInFuture,
	ModuleConfigSchema,
} from "@interval/engine";

const actionInputSchema = z.object({
	moduleType: ModuleTypeSchema,
	timestamp: z.string().datetime().optional(),
	reasonLabel: ReasonLabelSchema.optional(),
	actionKind: ActionKindSchema.optional(),
	payload: z.record(z.string(), z.unknown()).optional(),
});

const delayInputSchema = z.object({
	moduleType: ModuleTypeSchema,
	delayMinutes: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)]),
	triggerContext: TriggerContextSchema,
	timestamp: z.string().datetime().optional(),
});

const adjustmentInputSchema = z.object({
	moduleType: ModuleTypeSchema,
	adjustmentKind: AdjustmentKindSchema,
	payload: z.record(z.string(), z.unknown()).optional(),
});

const updateSettingsInputSchema = z.object({
	dayAnchorMinutes: z.number().int().min(0).max(1439).optional(),
	modules: z
		.array(
			z.object({
				moduleType: ModuleTypeSchema,
				enabled: z.boolean().optional(),
				targetIntervalMin: z.number().int().min(1).max(480).optional(),
				config: ModuleConfigSchema.optional(),
			}),
		)
		.optional(),
});

export const engineRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.get("/today", async (request) => {
		const userId = request.session.userId!;
		const query = request.query as { now?: string };

		let now = new Date();
		if (query.now && process.env.NODE_ENV !== "production") {
			now = new Date(query.now);
		}

		const summary = await getEngineTodaySummary(userId, now);
		return { success: true, data: summary };
	});

	app.post("/events/action", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = actionInputSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const timestampValidation = validateTimestampNotTooFarInFuture(parsed.data.timestamp);
		if (!timestampValidation.valid) {
			return reply.code(400).send({ success: false, error: timestampValidation.error });
		}

		try {
			const result = await createActionEvent(userId, parsed.data);
			return { success: true, ...result };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			if (message.includes("not enabled") || message.includes("Duplicate")) {
				return reply.code(400).send({ success: false, error: message });
			}
			throw error;
		}
	});

	app.post("/events/delay", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = delayInputSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const timestampValidation = validateTimestampNotTooFarInFuture(parsed.data.timestamp);
		if (!timestampValidation.valid) {
			return reply.code(400).send({ success: false, error: timestampValidation.error });
		}

		try {
			const result = await createDelayEvent(userId, parsed.data);
			return { success: true, ...result };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			if (message.includes("not enabled")) {
				return reply.code(400).send({ success: false, error: message });
			}
			throw error;
		}
	});

	app.post("/events/adjustment", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = adjustmentInputSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		try {
			const result = await createAdjustmentEvent(userId, parsed.data);
			return { success: true, ...result };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			if (message.includes("not enabled")) {
				return reply.code(400).send({ success: false, error: message });
			}
			throw error;
		}
	});

	app.get("/report/weekly", async (request) => {
		const userId = request.session.userId!;
		const query = request.query as { weekStart?: string };

		const report = await getEngineWeeklyReport(userId, query.weekStart);
		return { success: true, data: report };
	});

	app.get("/settings", async (request) => {
		const userId = request.session.userId!;
		const settings = await getModuleSettings(userId);
		return { success: true, data: settings };
	});

	app.put("/settings", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = updateSettingsInputSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const settings = await updateModuleSettings(userId, parsed.data);
		return { success: true, data: settings };
	});
};
