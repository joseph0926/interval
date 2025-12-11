import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../hooks/auth.js";
import { toUserDto } from "../mappers/user.js";

const completeSchema = z.object({
	dailySmokingRange: z.enum(["UNDER_5", "FROM_5_10", "FROM_10_20", "OVER_20", "UNKNOWN"]),
	targetInterval: z.number().int().min(1).max(480),
	motivation: z.string().max(200).optional(),
	dayStartTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional(),
	nickname: z.string().min(1).max(20).optional(),
});

export const onboardingRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.post("/complete", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = completeSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const { dailySmokingRange, targetInterval, motivation, dayStartTime, nickname } = parsed.data;

		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				dailySmokingRange,
				currentTargetInterval: targetInterval,
				currentMotivation: motivation ?? null,
				dayStartTime: dayStartTime ?? "04:00",
				nickname: nickname ?? null,
				onboardingCompleted: true,
			},
		});

		return { success: true, user: toUserDto(user) };
	});
};
