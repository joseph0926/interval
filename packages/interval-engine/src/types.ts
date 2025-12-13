import { z } from "zod";

export const ModuleType = {
	SMOKE: "SMOKE",
	SNS: "SNS",
	CAFFEINE: "CAFFEINE",
	FOCUS: "FOCUS",
} as const;
export type ModuleType = (typeof ModuleType)[keyof typeof ModuleType];
export const ModuleTypeSchema = z.enum(["SMOKE", "SNS", "CAFFEINE", "FOCUS"]);

export const EventType = {
	ACTION: "ACTION",
	DELAY: "DELAY",
	ADJUSTMENT: "ADJUSTMENT",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];
export const EventTypeSchema = z.enum(["ACTION", "DELAY", "ADJUSTMENT"]);

export const ActionKind = {
	CONSUME_OR_OPEN: "CONSUME_OR_OPEN",
	SESSION_START: "SESSION_START",
	SESSION_END: "SESSION_END",
} as const;
export type ActionKind = (typeof ActionKind)[keyof typeof ActionKind];
export const ActionKindSchema = z.enum(["CONSUME_OR_OPEN", "SESSION_START", "SESSION_END"]);

export const ReasonLabel = {
	BREAK: "BREAK",
	BORED: "BORED",
	STRESS: "STRESS",
	HABIT: "HABIT",
	AVOID: "AVOID",
	LINK: "LINK",
	OTHER: "OTHER",
} as const;
export type ReasonLabel = (typeof ReasonLabel)[keyof typeof ReasonLabel];
export const ReasonLabelSchema = z.enum([
	"BREAK",
	"BORED",
	"STRESS",
	"HABIT",
	"AVOID",
	"LINK",
	"OTHER",
]);

export const TriggerContext = {
	EARLY_URGE: "EARLY_URGE",
	FLOATING_CARD: "FLOATING_CARD",
	FOCUS_EXTEND: "FOCUS_EXTEND",
	MANUAL: "MANUAL",
} as const;
export type TriggerContext = (typeof TriggerContext)[keyof typeof TriggerContext];
export const TriggerContextSchema = z.enum([
	"EARLY_URGE",
	"FLOATING_CARD",
	"FOCUS_EXTEND",
	"MANUAL",
]);

export const ModuleStatus = {
	DISABLED: "DISABLED",
	SETUP_REQUIRED: "SETUP_REQUIRED",
	NO_BASELINE: "NO_BASELINE",
	COUNTDOWN: "COUNTDOWN",
	READY: "READY",
	GAP_DETECTED: "GAP_DETECTED",
} as const;
export type ModuleStatus = (typeof ModuleStatus)[keyof typeof ModuleStatus];
export const ModuleStatusSchema = z.enum([
	"DISABLED",
	"SETUP_REQUIRED",
	"NO_BASELINE",
	"COUNTDOWN",
	"READY",
	"GAP_DETECTED",
]);

export const AdjustmentKind = {
	RESET_BASELINE: "RESET_BASELINE",
	APPROXIMATE_LOG: "APPROXIMATE_LOG",
} as const;
export type AdjustmentKind = (typeof AdjustmentKind)[keyof typeof AdjustmentKind];
export const AdjustmentKindSchema = z.enum(["RESET_BASELINE", "APPROXIMATE_LOG"]);

export const CtaKey = {
	LOG_ACTION: "LOG_ACTION",
	URGE: "URGE",
	RECOVER: "RECOVER",
} as const;
export type CtaKey = (typeof CtaKey)[keyof typeof CtaKey];
export const CtaKeySchema = z.enum(["LOG_ACTION", "URGE", "RECOVER"]);

export const IntervalEventSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	moduleType: ModuleTypeSchema,
	eventType: EventTypeSchema,
	timestamp: z.string().datetime(),
	localDayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	actionKind: ActionKindSchema.optional(),
	delayMinutes: z.number().int().positive().optional(),
	reasonLabel: ReasonLabelSchema.optional(),
	triggerContext: TriggerContextSchema.optional(),
	payload: z.record(z.string(), z.unknown()).optional(),
});
export type IntervalEvent = z.infer<typeof IntervalEventSchema>;

export const CtaPrimarySchema = z.object({
	key: CtaKeySchema,
	enabled: z.boolean(),
});
export type CtaPrimary = z.infer<typeof CtaPrimarySchema>;

export const ModuleStateSchema = z.object({
	moduleType: ModuleTypeSchema,
	status: ModuleStatusSchema,
	lastActionTime: z.string().datetime().optional(),
	targetIntervalMin: z.number().int().positive().optional(),
	targetTime: z.string().datetime().optional(),
	remainingMin: z.number().int().optional(),
	actualIntervalMin: z.number().int().optional(),
	todayEarnedMin: z.number().int().default(0),
	todayLostMin: z.number().int().default(0),
	todayNetMin: z.number().int().default(0),
	ctaPrimary: CtaPrimarySchema,
});
export type ModuleState = z.infer<typeof ModuleStateSchema>;

export const IntegratedSummarySchema = z.object({
	earnedMin: z.number().int().default(0),
	lostMin: z.number().int().default(0),
	netMin: z.number().int().default(0),
	level: z.number().int().optional(),
	nextLevelRemainingMin: z.number().int().optional(),
});
export type IntegratedSummary = z.infer<typeof IntegratedSummarySchema>;

export const TodaySummarySchema = z.object({
	dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	integrated: IntegratedSummarySchema,
	modules: z.array(ModuleStateSchema),
});
export type TodaySummary = z.infer<typeof TodaySummarySchema>;

export const WeeklyModuleReportSchema = z.object({
	moduleType: ModuleTypeSchema,
	earnedMin: z.number().int().default(0),
	lostMin: z.number().int().default(0),
	netMin: z.number().int().default(0),
	avgIntervalMin: z.number().optional(),
});
export type WeeklyModuleReport = z.infer<typeof WeeklyModuleReportSchema>;

export const WeeklyReportSchema = z.object({
	weekStartDayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	integrated: z.object({
		earnedMin: z.number().int().default(0),
		lostMin: z.number().int().default(0),
		netMin: z.number().int().default(0),
	}),
	modules: z.array(WeeklyModuleReportSchema),
});
export type WeeklyReport = z.infer<typeof WeeklyReportSchema>;

export const ModuleSettingSchema = z.object({
	moduleType: ModuleTypeSchema,
	enabled: z.boolean(),
	targetIntervalMin: z.number().int().positive(),
});
export type ModuleSetting = z.infer<typeof ModuleSettingSchema>;

export const UserEngineSettingsSchema = z.object({
	dayAnchorMinutes: z.number().int().min(0).max(1439).default(240),
	modules: z.array(ModuleSettingSchema),
});
export type UserEngineSettings = z.infer<typeof UserEngineSettingsSchema>;
