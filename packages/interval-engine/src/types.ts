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
	FOCUS_IDLE: "FOCUS_IDLE",
	FOCUS_RUNNING: "FOCUS_RUNNING",
	FOCUS_COACHING: "FOCUS_COACHING",
} as const;
export type ModuleStatus = (typeof ModuleStatus)[keyof typeof ModuleStatus];
export const ModuleStatusSchema = z.enum([
	"DISABLED",
	"SETUP_REQUIRED",
	"NO_BASELINE",
	"COUNTDOWN",
	"READY",
	"GAP_DETECTED",
	"FOCUS_IDLE",
	"FOCUS_RUNNING",
	"FOCUS_COACHING",
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
	START_SESSION: "START_SESSION",
	END_SESSION: "END_SESSION",
	URGE_INTERRUPT: "URGE_INTERRUPT",
} as const;
export type CtaKey = (typeof CtaKey)[keyof typeof CtaKey];
export const CtaKeySchema = z.enum([
	"LOG_ACTION",
	"URGE",
	"RECOVER",
	"START_SESSION",
	"END_SESSION",
	"URGE_INTERRUPT",
]);

export const SessionEndReason = {
	USER_END: "USER_END",
	URGE: "URGE",
	AUTO: "AUTO",
} as const;
export type SessionEndReason = (typeof SessionEndReason)[keyof typeof SessionEndReason];
export const SessionEndReasonSchema = z.enum(["USER_END", "URGE", "AUTO"]);

export const SessionStartPayloadSchema = z.object({
	plannedMinutes: z.number().int().positive(),
});
export type SessionStartPayload = z.infer<typeof SessionStartPayloadSchema>;

export const SessionEndPayloadSchema = z.object({
	actualMinutes: z.number().int().min(0),
	endReason: SessionEndReasonSchema,
});
export type SessionEndPayload = z.infer<typeof SessionEndPayloadSchema>;

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

export const FocusSessionInfoSchema = z.object({
	sessionStartTime: z.string().datetime(),
	plannedMinutes: z.number().int().positive(),
	elapsedMinutes: z.number().int().min(0),
	remainingMinutes: z.number().int(),
	extendedMinutes: z.number().int().min(0),
});
export type FocusSessionInfo = z.infer<typeof FocusSessionInfoSchema>;

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
	focusSession: FocusSessionInfoSchema.optional(),
	todayActionCount: z.number().int().default(0),
	todayFocusTotalMin: z.number().int().default(0),
	dailyGoalCount: z.number().int().optional(),
	defaultSessionMin: z.number().int().optional(),
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

export const FloatingSuggestionSchema = z.object({
	moduleType: ModuleTypeSchema,
	remainingMin: z.number().int(),
	options: z.array(z.union([z.literal(1), z.literal(3)])),
});
export type FloatingSuggestion = z.infer<typeof FloatingSuggestionSchema>;

export const TodaySummarySchema = z.object({
	dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	integrated: IntegratedSummarySchema,
	modules: z.array(ModuleStateSchema),
	floatingSuggestion: FloatingSuggestionSchema.optional(),
});
export type TodaySummary = z.infer<typeof TodaySummarySchema>;

export const WeeklyModuleReportSchema = z.object({
	moduleType: ModuleTypeSchema,
	earnedMin: z.number().int().default(0),
	lostMin: z.number().int().default(0),
	netMin: z.number().int().default(0),
	avgIntervalMin: z.number().optional(),
	actionCount: z.number().int().default(0),
	focusTotalMin: z.number().int().default(0),
	avgSessionMin: z.number().optional(),
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

export const ModuleConfigSchema = z.object({
	dailyGoalCount: z.number().int().positive().optional(),
	defaultSessionMin: z.number().int().positive().optional(),
});
export type ModuleConfig = z.infer<typeof ModuleConfigSchema>;

export const ModuleSettingSchema = z.object({
	moduleType: ModuleTypeSchema,
	enabled: z.boolean(),
	targetIntervalMin: z.number().int().positive(),
	config: ModuleConfigSchema.optional(),
});
export type ModuleSetting = z.infer<typeof ModuleSettingSchema>;

export const UserEngineSettingsSchema = z.object({
	dayAnchorMinutes: z.number().int().min(0).max(1439).default(240),
	modules: z.array(ModuleSettingSchema),
});
export type UserEngineSettings = z.infer<typeof UserEngineSettingsSchema>;

export const INTERVAL_MODULES: ModuleType[] = ["SMOKE", "SNS", "CAFFEINE"];
export const SESSION_MODULES: ModuleType[] = ["FOCUS"];

export function isIntervalModule(moduleType: ModuleType): boolean {
	return INTERVAL_MODULES.includes(moduleType);
}

export function isSessionModule(moduleType: ModuleType): boolean {
	return SESSION_MODULES.includes(moduleType);
}
