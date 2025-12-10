import { defineModel } from "@firsttx/local-first";
import { z } from "zod";

const todaySummarySchema = z.object({
	totalSmoked: z.number(),
	averageInterval: z.number().nullable(),
	totalDelayMinutes: z.number(),
	targetInterval: z.number(),
	motivation: z.string().nullable(),
	lastSmokedAt: z.string().nullable(),
	firstSmokedAt: z.string().nullable(),
	nextTargetTime: z.string().nullable(),
	earlyCount: z.number(),
});

export const TodaySummaryModel = defineModel("todaySummary", {
	schema: todaySummarySchema,
	ttl: 30 * 1000,
	initialData: {
		totalSmoked: 0,
		averageInterval: null,
		totalDelayMinutes: 0,
		targetInterval: 60,
		motivation: null,
		lastSmokedAt: null,
		firstSmokedAt: null,
		nextTargetTime: null,
		earlyCount: 0,
	},
});
