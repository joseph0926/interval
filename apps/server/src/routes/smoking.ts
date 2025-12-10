import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../lib/db";
import { authMiddleware } from "../middleware/auth";
import { zodErrorHook } from "../lib/zod-hook";
import { Errors } from "../lib/errors";
import { getUserDayBoundary, getKSTStartOfDay } from "../lib/date";

const reasonCodeEnum = z.enum([
	"BREAK_TIME",
	"STRESS",
	"HABIT",
	"BORED",
	"SOCIAL",
	"AFTER_MEAL",
	"OTHER",
]);

const recordSmokingSchema = z.object({
	smokedAt: z.string().datetime(),
	type: z.enum(["FIRST", "NORMAL", "EARLY"]),
	reasonCode: reasonCodeEnum.optional(),
	reasonText: z.string().max(200).optional(),
	coachingMode: z.enum(["NONE", "LIGHT", "FULL"]).default("NONE"),
	emotionNote: z.string().max(200).optional(),
	delayedMinutes: z.number().min(0).default(0),
});

const addDelaySchema = z.object({
	minutes: z.number().min(1).max(30),
});

export const smokingRoutes = new Hono()
	.use("*", authMiddleware)

	.get("/today", async (c) => {
		const userId = c.get("userId");

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
				select: {
					currentTargetInterval: true,
					currentMotivation: true,
					dayStartTime: true,
				},
			});

			const dayStartTime = user?.dayStartTime ?? "04:00";
			const { start: startOfDay, end: endOfDay } = getUserDayBoundary(new Date(), dayStartTime);

			const records = await db.smokingRecord.findMany({
				where: {
					userId,
					smokedAt: { gte: startOfDay, lte: endOfDay },
				},
				orderBy: { smokedAt: "asc" },
			});

			const totalSmoked = records.length;
			const totalDelayMinutes = records.reduce(
				(sum: number, r: { delayedMinutes: number }) => sum + r.delayedMinutes,
				0,
			);

			let averageInterval: number | null = null;
			if (records.length >= 2) {
				const intervals = records
					.slice(1)
					.map((r: { intervalFromPrevious: number | null }) => r.intervalFromPrevious)
					.filter((i: number | null): i is number => i !== null);

				if (intervals.length > 0) {
					averageInterval = Math.round(
						intervals.reduce((a: number, b: number) => a + b, 0) / intervals.length,
					);
				}
			}

			const lastRecord = records[records.length - 1] ?? null;
			const firstRecord = records[0] ?? null;

			let nextTargetTime: string | null = null;
			if (lastRecord && user) {
				const next = new Date(
					lastRecord.smokedAt.getTime() + user.currentTargetInterval * 60 * 1000,
				);
				nextTargetTime = next.toISOString();
			}

			const earlyCount = records.filter((r: { type: string }) => r.type === "EARLY").length;

			return c.json({
				success: true,
				data: {
					totalSmoked,
					averageInterval,
					totalDelayMinutes,
					targetInterval: user?.currentTargetInterval ?? 60,
					motivation: user?.currentMotivation ?? null,
					lastSmokedAt: lastRecord?.smokedAt.toISOString() ?? null,
					firstSmokedAt: firstRecord?.smokedAt.toISOString() ?? null,
					nextTargetTime,
					earlyCount,
					dayStartTime,
				},
			});
		} catch {
			throw Errors.database("오늘의 요약을 가져오는데 실패했습니다");
		}
	})

	.post("/record", zValidator("json", recordSmokingSchema, zodErrorHook), async (c) => {
		const userId = c.get("userId");
		const data = c.req.valid("json");
		const smokedAt = new Date(data.smokedAt);

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
				select: {
					currentTargetInterval: true,
					dayStartTime: true,
					totalDelayMinutes: true,
				},
			});

			const dayStartTime = user?.dayStartTime ?? "04:00";
			const { start: startOfDay, dateStr } = getUserDayBoundary(smokedAt, dayStartTime);

			const lastRecord = await db.smokingRecord.findFirst({
				where: {
					userId,
					smokedAt: { lt: smokedAt, gte: startOfDay },
				},
				orderBy: { smokedAt: "desc" },
			});

			let intervalFromPrevious: number | null = null;
			let wasOnTarget: boolean | null = null;

			if (lastRecord) {
				intervalFromPrevious = Math.round(
					(smokedAt.getTime() - lastRecord.smokedAt.getTime()) / (1000 * 60),
				);
				wasOnTarget = intervalFromPrevious >= (user?.currentTargetInterval ?? 60);
			}

			const record = await db.smokingRecord.create({
				data: {
					userId,
					smokedAt,
					type: data.type,
					reasonCode: data.reasonCode,
					reasonText: data.reasonText,
					coachingMode: data.coachingMode,
					emotionNote: data.emotionNote,
					delayedMinutes: data.delayedMinutes,
					intervalFromPrevious,
					targetIntervalAtTime: user?.currentTargetInterval ?? 60,
					wasOnTarget,
				},
			});

			if (data.delayedMinutes > 0) {
				await db.user.update({
					where: { id: userId },
					data: {
						totalDelayMinutes: { increment: data.delayedMinutes },
					},
				});
			}

			await updateDailySnapshot(userId, dateStr, dayStartTime);

			return c.json({
				success: true,
				record: {
					id: record.id,
					smokedAt: record.smokedAt.toISOString(),
					type: record.type,
					intervalFromPrevious,
					wasOnTarget,
					delayedMinutes: record.delayedMinutes,
				},
			});
		} catch {
			throw Errors.database("흡연 기록 저장에 실패했습니다");
		}
	})

	.post("/delay", zValidator("json", addDelaySchema, zodErrorHook), async (c) => {
		const userId = c.get("userId");
		const { minutes } = c.req.valid("json");

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
				select: { dayStartTime: true, currentTargetInterval: true },
			});

			const dayStartTime = user?.dayStartTime ?? "04:00";
			const { dateStr } = getUserDayBoundary(new Date(), dayStartTime);
			const snapshotDate = getKSTStartOfDay(dateStr);

			const [snapshot] = await Promise.all([
				db.dailySnapshot.upsert({
					where: { userId_date: { userId, date: snapshotDate } },
					create: {
						userId,
						date: snapshotDate,
						targetInterval: user?.currentTargetInterval ?? 60,
						totalDelayMinutes: minutes,
						hasDelaySuccess: true,
					},
					update: {
						totalDelayMinutes: { increment: minutes },
						hasDelaySuccess: true,
					},
				}),
				db.user.update({
					where: { id: userId },
					data: {
						totalDelayMinutes: { increment: minutes },
					},
				}),
			]);

			return c.json({
				success: true,
				totalDelayMinutes: snapshot.totalDelayMinutes,
				addedMinutes: minutes,
			});
		} catch {
			throw Errors.database("미루기 시간 추가에 실패했습니다");
		}
	})

	.get("/history", async (c) => {
		const userId = c.get("userId");
		const limitStr = c.req.query("limit");
		const limit = limitStr ? parseInt(limitStr, 10) : 20;

		try {
			const records = await db.smokingRecord.findMany({
				where: { userId },
				orderBy: { smokedAt: "desc" },
				take: Math.min(limit, 100),
				select: {
					id: true,
					smokedAt: true,
					type: true,
					reasonCode: true,
					reasonText: true,
					intervalFromPrevious: true,
					wasOnTarget: true,
					delayedMinutes: true,
				},
			});

			return c.json({
				success: true,
				records: records.map(
					(r: {
						id: string;
						smokedAt: Date;
						type: string;
						reasonCode: string | null;
						reasonText: string | null;
						intervalFromPrevious: number | null;
						wasOnTarget: boolean | null;
						delayedMinutes: number;
					}) => ({
						...r,
						smokedAt: r.smokedAt.toISOString(),
					}),
				),
			});
		} catch {
			throw Errors.database("흡연 기록 조회에 실패했습니다");
		}
	})

	.get("/check-gap", async (c) => {
		const userId = c.get("userId");

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
				select: { dayStartTime: true, currentTargetInterval: true },
			});

			const lastRecord = await db.smokingRecord.findFirst({
				where: { userId },
				orderBy: { smokedAt: "desc" },
			});

			if (!lastRecord) {
				return c.json({
					success: true,
					data: { hasGap: false, gapMinutes: 0, threshold: 0 },
				});
			}

			const now = new Date();
			const gapMinutes = Math.round((now.getTime() - lastRecord.smokedAt.getTime()) / (1000 * 60));

			const targetInterval = user?.currentTargetInterval ?? 60;
			const threshold = Math.max(targetInterval * 2, 150);

			return c.json({
				success: true,
				data: {
					hasGap: gapMinutes >= threshold,
					gapMinutes,
					threshold,
					lastSmokedAt: lastRecord.smokedAt.toISOString(),
				},
			});
		} catch {
			throw Errors.database("갭 확인에 실패했습니다");
		}
	})

	.post(
		"/soft-reset",
		zValidator(
			"json",
			z.object({
				approximateCount: z.number().min(0).max(50).optional(),
			}),
			zodErrorHook,
		),
		async (c) => {
			const userId = c.get("userId");
			const { approximateCount } = c.req.valid("json");

			try {
				const user = await db.user.findUnique({
					where: { id: userId },
					select: { dayStartTime: true, currentTargetInterval: true },
				});

				const dayStartTime = user?.dayStartTime ?? "04:00";
				const now = new Date();
				const { dateStr } = getUserDayBoundary(now, dayStartTime);
				const snapshotDate = getKSTStartOfDay(dateStr);

				if (approximateCount !== undefined && approximateCount > 0) {
					await db.dailySnapshot.upsert({
						where: { userId_date: { userId, date: snapshotDate } },
						create: {
							userId,
							date: snapshotDate,
							targetInterval: user?.currentTargetInterval ?? 60,
							totalSmoked: approximateCount,
						},
						update: {
							totalSmoked: { increment: approximateCount },
						},
					});
				}

				return c.json({
					success: true,
					message: "지금부터 다시 시작합니다",
					resetAt: now.toISOString(),
				});
			} catch {
				throw Errors.database("소프트 리셋에 실패했습니다");
			}
		},
	);

async function updateDailySnapshot(userId: string, dateStr: string, dayStartTime: string) {
	const { start: startOfDay, end: endOfDay } = getUserDayBoundary(
		new Date(`${dateStr}T12:00:00+09:00`),
		dayStartTime,
	);
	const snapshotDate = getKSTStartOfDay(dateStr);

	const records = await db.smokingRecord.findMany({
		where: {
			userId,
			smokedAt: { gte: startOfDay, lte: endOfDay },
		},
		orderBy: { smokedAt: "asc" },
	});

	const totalSmoked = records.length;
	const totalDelayMinutes = records.reduce(
		(sum: number, r: { delayedMinutes: number }) => sum + r.delayedMinutes,
		0,
	);
	const hasDelaySuccess = totalDelayMinutes > 0;

	let averageInterval: number | null = null;
	if (records.length >= 2) {
		const intervals = records
			.slice(1)
			.map((r: { intervalFromPrevious: number | null }) => r.intervalFromPrevious)
			.filter((i: number | null): i is number => i !== null);

		if (intervals.length > 0) {
			averageInterval = intervals.reduce((a: number, b: number) => a + b, 0) / intervals.length;
		}
	}

	const firstRecord = records[0];
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { currentTargetInterval: true, currentMotivation: true },
	});

	await db.dailySnapshot.upsert({
		where: { userId_date: { userId, date: snapshotDate } },
		create: {
			userId,
			date: snapshotDate,
			targetInterval: user?.currentTargetInterval ?? 60,
			motivation: user?.currentMotivation,
			totalSmoked,
			averageInterval,
			totalDelayMinutes,
			firstSmokeTime: firstRecord?.smokedAt ?? null,
			hasDelaySuccess,
		},
		update: {
			totalSmoked,
			averageInterval,
			totalDelayMinutes,
			firstSmokeTime: firstRecord?.smokedAt ?? null,
			hasDelaySuccess,
		},
	});
}
