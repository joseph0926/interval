import type { FastifyPluginAsync } from "fastify";
import { getWeeklyReport, getStreak, getInsight } from "../services/report.js";

export const reportRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", async (request, reply) => {
		if (!request.session.userId) {
			reply.code(401).send({ success: false, error: "Unauthorized" });
		}
	});

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
