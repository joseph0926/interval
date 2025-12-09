import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../lib/db";
import { authMiddleware } from "../middleware/auth";
import { zodErrorHook } from "../lib/zod-hook";
import { Errors } from "../lib/errors";

const reasonCodeEnum = z.enum([
	"STRESS",
	"HABIT",
	"BORED",
	"SOCIAL",
	"AFTER_MEAL",
	"BREAK_TIME",
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

function getKSTDateString(date: Date): string {
	const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
	return kst.toISOString().split("T")[0];
}

function getKSTStartOfDay(dateStr: string): Date {
	return new Date(`${dateStr}T00:00:00+09:00`);
}

function getKSTEndOfDay(dateStr: string): Date {
	return new Date(`${dateStr}T23:59:59.999+09:00`);
}

export const smokingRoutes = new Hono()
	.use("*", authMiddleware)

	.get("/today", async (c) => {
		const userId = c.get("userId");
		const today = getKSTDateString(new Date());
		const startOfDay = getKSTStartOfDay(today);
		const endOfDay = getKSTEndOfDay(today);

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
				select: {
					currentTargetInterval: true,
					currentMotivation: true,
				},
			});

			const records = await db.smokingRecord.findMany({
				where: {
					userId,
					smokedAt: { gte: startOfDay, lte: endOfDay },
				},
				orderBy: { smokedAt: "asc" },
			});

			const totalSmoked = records.length;
			const totalDelayMinutes = records.reduce((sum, r) => sum + r.delayedMinutes, 0);

			let averageInterval: number | null = null;
			if (records.length >= 2) {
				const intervals = records
					.slice(1)
					.map((r) => r.intervalFromPrevious)
					.filter((i): i is number => i !== null);

				if (intervals.length > 0) {
					averageInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
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

			const earlyCount = records.filter((r) => r.type === "EARLY").length;

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
				select: { currentTargetInterval: true },
			});

			const today = getKSTDateString(smokedAt);
			const startOfDay = getKSTStartOfDay(today);

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
					reasonCode: data.reasonCode === "BREAK_TIME" ? "OTHER" : data.reasonCode,
					reasonText: data.reasonCode === "BREAK_TIME" ? "쉬는 시간" : data.reasonText,
					coachingMode: data.coachingMode,
					emotionNote: data.emotionNote,
					delayedMinutes: data.delayedMinutes,
					intervalFromPrevious,
					targetIntervalAtTime: user?.currentTargetInterval ?? 60,
					wasOnTarget,
				},
			});

			await updateDailySnapshot(userId, today);

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
		const today = getKSTDateString(new Date());

		try {
			const snapshot = await db.dailySnapshot.upsert({
				where: { userId_date: { userId, date: getKSTStartOfDay(today) } },
				create: {
					userId,
					date: getKSTStartOfDay(today),
					targetInterval: 60,
					totalDelayMinutes: minutes,
					hasDelaySuccess: true,
				},
				update: {
					totalDelayMinutes: { increment: minutes },
					hasDelaySuccess: true,
				},
			});

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
				records: records.map((r) => ({
					...r,
					smokedAt: r.smokedAt.toISOString(),
				})),
			});
		} catch {
			throw Errors.database("흡연 기록 조회에 실패했습니다");
		}
	});

async function updateDailySnapshot(userId: string, dateStr: string) {
	const startOfDay = getKSTStartOfDay(dateStr);
	const endOfDay = getKSTEndOfDay(dateStr);

	const records = await db.smokingRecord.findMany({
		where: {
			userId,
			smokedAt: { gte: startOfDay, lte: endOfDay },
		},
		orderBy: { smokedAt: "asc" },
	});

	const totalSmoked = records.length;
	const totalDelayMinutes = records.reduce((sum, r) => sum + r.delayedMinutes, 0);
	const hasDelaySuccess = totalDelayMinutes > 0;

	let averageInterval: number | null = null;
	if (records.length >= 2) {
		const intervals = records
			.slice(1)
			.map((r) => r.intervalFromPrevious)
			.filter((i): i is number => i !== null);

		if (intervals.length > 0) {
			averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
		}
	}

	const firstRecord = records[0];
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { currentTargetInterval: true, currentMotivation: true },
	});

	await db.dailySnapshot.upsert({
		where: { userId_date: { userId, date: startOfDay } },
		create: {
			userId,
			date: startOfDay,
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
