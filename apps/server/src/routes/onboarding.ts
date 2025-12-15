import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { requireAuth } from "../hooks/auth.js";
import { toUserDto } from "../mappers/user.js";
import { ModuleTypeSchema, type ModuleType } from "@interval/engine";

const ModuleSettingSchema = z.object({
	moduleType: ModuleTypeSchema,
	enabled: z.boolean().default(true),
	targetIntervalMin: z.number().int().min(1).max(480).optional(),
	config: z
		.object({
			dailyGoalCount: z.number().int().min(1).max(20).optional(),
			defaultSessionMin: z.number().int().min(5).max(120).optional(),
		})
		.optional(),
});

const completeSchema = z.object({
	dailySmokingRange: z
		.enum(["UNDER_5", "FROM_5_10", "FROM_10_20", "OVER_20", "UNKNOWN"])
		.optional(),
	targetInterval: z.number().int().min(1).max(480).optional(),
	motivation: z.string().max(200).optional(),
	dayStartTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional(),
	nickname: z.string().min(1).max(20).optional(),
	modules: z.array(ModuleSettingSchema).min(1).max(4).optional(),
});

export const onboardingRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.post("/complete", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = completeSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const { dailySmokingRange, targetInterval, motivation, dayStartTime, nickname, modules } =
			parsed.data;

		const DEFAULT_INTERVALS: Record<string, number> = {
			SMOKE: 60,
			SNS: 30,
			CAFFEINE: 180,
			FOCUS: 10,
		};

		const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
			const updatedUser = await tx.user.update({
				where: { id: userId },
				data: {
					dailySmokingRange: dailySmokingRange ?? null,
					currentTargetInterval: targetInterval ?? 60,
					currentMotivation: motivation ?? null,
					dayStartTime: dayStartTime ?? "04:00",
					nickname: nickname ?? null,
					onboardingCompleted: true,
				},
			});

			if (modules && modules.length > 0) {
				for (const mod of modules) {
					await tx.userModuleSetting.upsert({
						where: {
							userId_moduleType: {
								userId,
								moduleType: mod.moduleType,
							},
						},
						create: {
							userId,
							moduleType: mod.moduleType,
							enabled: mod.enabled,
							targetIntervalMin: mod.targetIntervalMin ?? DEFAULT_INTERVALS[mod.moduleType] ?? 60,
							configJson: mod.config ?? undefined,
						},
						update: {
							enabled: mod.enabled,
							targetIntervalMin: mod.targetIntervalMin ?? DEFAULT_INTERVALS[mod.moduleType] ?? 60,
							configJson: mod.config ?? undefined,
						},
					});
				}

				const allModuleTypes: ModuleType[] = ["SMOKE", "SNS", "CAFFEINE", "FOCUS"];
				const enabledModuleTypes = modules.map((m) => m.moduleType);
				const disabledModuleTypes = allModuleTypes.filter((t) => !enabledModuleTypes.includes(t));

				for (const moduleType of disabledModuleTypes) {
					await tx.userModuleSetting.upsert({
						where: {
							userId_moduleType: {
								userId,
								moduleType,
							},
						},
						create: {
							userId,
							moduleType,
							enabled: false,
							targetIntervalMin: DEFAULT_INTERVALS[moduleType] ?? 60,
						},
						update: {
							enabled: false,
						},
					});
				}
			}

			return updatedUser;
		});

		return { success: true, user: toUserDto(user) };
	});
};
