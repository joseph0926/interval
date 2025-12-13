import { defineModel } from "@firsttx/local-first";
import { z } from "zod";

const ctaPrimarySchema = z.object({
	key: z.enum(["LOG_ACTION", "URGE", "RECOVER"]),
	enabled: z.boolean(),
});

const moduleStateSchema = z.object({
	moduleType: z.enum(["SMOKE", "SNS", "CAFFEINE", "FOCUS"]),
	status: z.enum([
		"DISABLED",
		"SETUP_REQUIRED",
		"NO_BASELINE",
		"COUNTDOWN",
		"READY",
		"GAP_DETECTED",
	]),
	lastActionTime: z.string().optional(),
	targetIntervalMin: z.number().optional(),
	targetTime: z.string().optional(),
	remainingMin: z.number().optional(),
	actualIntervalMin: z.number().optional(),
	todayEarnedMin: z.number(),
	todayLostMin: z.number(),
	todayNetMin: z.number(),
	ctaPrimary: ctaPrimarySchema,
});

const integratedSummarySchema = z.object({
	earnedMin: z.number(),
	lostMin: z.number(),
	netMin: z.number(),
	level: z.number().optional(),
	nextLevelRemainingMin: z.number().optional(),
});

const engineTodaySummarySchema = z.object({
	dayKey: z.string(),
	integrated: integratedSummarySchema,
	modules: z.array(moduleStateSchema),
});

export const EngineTodaySummaryModel = defineModel("engineTodaySummary", {
	schema: engineTodaySummarySchema,
	ttl: 30 * 1000,
	initialData: {
		dayKey: new Date().toISOString().slice(0, 10),
		integrated: {
			earnedMin: 0,
			lostMin: 0,
			netMin: 0,
		},
		modules: [],
	},
});
