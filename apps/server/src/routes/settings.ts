import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../lib/db";
import { authMiddleware } from "../middleware/auth";
import { zodErrorHook } from "../lib/zod-hook";
import { Errors } from "../lib/errors";

const updateSettingsSchema = z.object({
	nickname: z.string().min(1).max(20).optional(),
	currentTargetInterval: z.number().min(30).max(180).optional(),
	currentMotivation: z.string().max(200).optional(),
	wakeUpTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional(),
});

export const settingsRoutes = new Hono()
	.use("*", authMiddleware)

	.get("/", async (c) => {
		const userId = c.get("userId");

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
				select: {
					nickname: true,
					dailySmokingRange: true,
					wakeUpTime: true,
					currentTargetInterval: true,
					currentMotivation: true,
				},
			});

			if (!user) {
				throw Errors.notFound("사용자");
			}

			return c.json({ success: true, settings: user });
		} catch (e) {
			if (e instanceof Error && e.message.includes("찾을 수 없습니다")) {
				throw e;
			}
			throw Errors.database("설정 조회에 실패했습니다");
		}
	})

	.patch("/", zValidator("json", updateSettingsSchema, zodErrorHook), async (c) => {
		const userId = c.get("userId");
		const data = c.req.valid("json");

		try {
			const user = await db.user.update({
				where: { id: userId },
				data,
				select: {
					nickname: true,
					dailySmokingRange: true,
					wakeUpTime: true,
					currentTargetInterval: true,
					currentMotivation: true,
				},
			});

			return c.json({ success: true, settings: user });
		} catch {
			throw Errors.database("설정 업데이트에 실패했습니다");
		}
	})

	.patch(
		"/target-interval",
		zValidator(
			"json",
			z.object({
				targetInterval: z.number().min(30).max(180),
			}),
			zodErrorHook,
		),
		async (c) => {
			const userId = c.get("userId");
			const { targetInterval } = c.req.valid("json");

			try {
				await db.user.update({
					where: { id: userId },
					data: { currentTargetInterval: targetInterval },
				});

				return c.json({ success: true, targetInterval });
			} catch {
				throw Errors.database("목표 간격 업데이트에 실패했습니다");
			}
		},
	)

	.patch(
		"/motivation",
		zValidator(
			"json",
			z.object({
				motivation: z.string().max(200),
			}),
			zodErrorHook,
		),
		async (c) => {
			const userId = c.get("userId");
			const { motivation } = c.req.valid("json");

			try {
				await db.user.update({
					where: { id: userId },
					data: { currentMotivation: motivation },
				});

				return c.json({ success: true, motivation });
			} catch {
				throw Errors.database("동기부여 메시지 업데이트에 실패했습니다");
			}
		},
	);
