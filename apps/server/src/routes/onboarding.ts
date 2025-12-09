import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../lib/db";
import { authMiddleware } from "../middleware/auth";
import { zodErrorHook } from "../lib/zod-hook";
import { Errors } from "../lib/errors";

const dailySmokingRangeEnum = z.enum(["UNDER_5", "FROM_5_10", "FROM_10_20", "OVER_20", "UNKNOWN"]);

const onboardingSchema = z.object({
	dailySmokingRange: dailySmokingRangeEnum,
	wakeUpTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional(),
	targetInterval: z.number().min(30).max(180),
	motivation: z.string().max(200).optional(),
	nickname: z.string().min(1).max(20).optional(),
});

function getRecommendedInterval(range: string): number {
	switch (range) {
		case "UNDER_5":
			return 120;
		case "FROM_5_10":
			return 90;
		case "FROM_10_20":
			return 60;
		case "OVER_20":
			return 45;
		default:
			return 60;
	}
}

function getEstimatedInterval(range: string): number {
	switch (range) {
		case "UNDER_5":
			return 180;
		case "FROM_5_10":
			return 100;
		case "FROM_10_20":
			return 50;
		case "OVER_20":
			return 30;
		default:
			return 60;
	}
}

export const onboardingRoutes = new Hono()
	.use("*", authMiddleware)

	.get("/recommendation", async (c) => {
		const rangeParam = c.req.query("range");

		if (!rangeParam) {
			return c.json({
				success: true,
				data: {
					estimatedInterval: 60,
					recommendedInterval: 60,
				},
			});
		}

		const estimated = getEstimatedInterval(rangeParam);
		const recommended = getRecommendedInterval(rangeParam);

		return c.json({
			success: true,
			data: {
				estimatedInterval: estimated,
				recommendedInterval: recommended,
			},
		});
	})

	.post("/complete", zValidator("json", onboardingSchema, zodErrorHook), async (c) => {
		const userId = c.get("userId");
		const data = c.req.valid("json");

		try {
			const user = await db.user.update({
				where: { id: userId },
				data: {
					dailySmokingRange: data.dailySmokingRange,
					wakeUpTime: data.wakeUpTime,
					currentTargetInterval: data.targetInterval,
					currentMotivation: data.motivation,
					nickname: data.nickname,
				},
				select: {
					id: true,
					isGuest: true,
					nickname: true,
					dailySmokingRange: true,
					wakeUpTime: true,
					currentTargetInterval: true,
					currentMotivation: true,
				},
			});

			return c.json({ success: true, user });
		} catch {
			throw Errors.database("온보딩 정보 저장에 실패했습니다");
		}
	})

	.get("/status", async (c) => {
		const userId = c.get("userId");

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
				select: {
					dailySmokingRange: true,
					currentTargetInterval: true,
					currentMotivation: true,
				},
			});

			const isCompleted = user?.dailySmokingRange !== null;

			return c.json({
				success: true,
				data: {
					isCompleted,
					hasSmokingRange: user?.dailySmokingRange !== null,
					hasTargetInterval: user?.currentTargetInterval !== null,
					hasMotivation: !!user?.currentMotivation,
				},
			});
		} catch {
			throw Errors.database("온보딩 상태 조회에 실패했습니다");
		}
	});
