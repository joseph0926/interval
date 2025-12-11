import type { FastifyPluginAsync } from "fastify";
import { getGamificationStatus } from "../services/gamification.js";

export const gamificationRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", async (request, reply) => {
		if (!request.session.userId) {
			reply.code(401).send({ success: false, error: "Unauthorized" });
		}
	});

	app.get("/status", async (request) => {
		const userId = request.session.userId!;
		const data = await getGamificationStatus(userId);
		return { success: true, data };
	});
};
