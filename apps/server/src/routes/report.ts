import type { FastifyPluginAsync } from "fastify";
import { requireAuth } from "../hooks/auth.js";
import { getWeeklyReport, getStreak, getInsight } from "../services/report.js";

export const reportRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.get("/weekly", async (request) => {
		const userId = request.session.userId!;
		const data = await getWeeklyReport(userId);
		return { success: true, data };
	});

	app.get("/streak", async (request) => {
		const userId = request.session.userId!;
		const data = await getStreak(userId);
		return { success: true, data };
	});

	app.get("/insight", async (request) => {
		const userId = request.session.userId!;
		const data = await getInsight(userId);
		return { success: true, data };
	});
};
