import type { FastifyPluginAsync } from "fastify";
import { requireAuth } from "../hooks/auth.js";
import { getGamificationStatus } from "../services/gamification.js";

export const gamificationRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.get("/status", async (request) => {
		const userId = request.session.userId!;
		const data = await getGamificationStatus(userId);
		return { success: true, data };
	});
};
