import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { requireAuth } from "../hooks/auth.js";
import { toUserDto } from "../mappers/user.js";
import type { UrgeType } from "../types/index.js";

const UrgeTypeSchema = z.enum(["SMOKE", "SNS"]);

const ModuleSettingSchema = z.object({
	moduleType: UrgeTypeSchema,
	enabled: z.boolean().default(true),
	defaultDuration: z.number().int().min(60).max(300).optional(),
	trackedApps: z.array(z.string()).optional(),
});

const completeSchema = z.object({
	nickname: z.string().min(1).max(20).optional(),
	dayAnchorMinutes: z.number().int().min(0).max(1440).optional(),
	modules: z.array(ModuleSettingSchema).min(1).max(2).optional(),
});

export const onboardingRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.post("/complete", async (request, reply) => {
		const userId = request.session.userId!;
		const parsed = completeSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.code(400).send({ success: false, error: parsed.error.message });
		}

		const { nickname, dayAnchorMinutes, modules } = parsed.data;

		const DEFAULT_DURATIONS: Record<string, number> = {
			SMOKE: 90,
			SNS: 90,
		};

		const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
			const enabledModules = modules?.filter((m) => m.enabled).map((m) => m.moduleType) ?? [
				"SMOKE",
			];

			const updatedUser = await tx.user.update({
				where: { id: userId },
				data: {
					nickname: nickname ?? null,
					dayAnchorMinutes: dayAnchorMinutes ?? 240,
					enabledModules,
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
							defaultDuration: mod.defaultDuration ?? DEFAULT_DURATIONS[mod.moduleType] ?? 90,
							trackedApps: mod.trackedApps ?? [],
						},
						update: {
							enabled: mod.enabled,
							defaultDuration: mod.defaultDuration ?? DEFAULT_DURATIONS[mod.moduleType] ?? 90,
							trackedApps: mod.trackedApps ?? [],
						},
					});
				}

				const allModuleTypes: UrgeType[] = ["SMOKE", "SNS"];
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
							defaultDuration: DEFAULT_DURATIONS[moduleType] ?? 90,
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
