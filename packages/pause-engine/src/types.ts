import { z } from "zod";

export const UrgeType = {
	SMOKE: "SMOKE",
	SNS: "SNS",
} as const;
export type UrgeType = (typeof UrgeType)[keyof typeof UrgeType];
export const UrgeTypeSchema = z.enum(["SMOKE", "SNS"]);

export const PauseEventType = {
	URGE: "URGE",
	PAUSE_START: "PAUSE_START",
	PAUSE_END: "PAUSE_END",
} as const;
export type PauseEventType = (typeof PauseEventType)[keyof typeof PauseEventType];
export const PauseEventTypeSchema = z.enum(["URGE", "PAUSE_START", "PAUSE_END"]);

export const PauseResult = {
	COMPLETED: "COMPLETED",
	GAVE_IN: "GAVE_IN",
	CANCELLED: "CANCELLED",
} as const;
export type PauseResult = (typeof PauseResult)[keyof typeof PauseResult];
export const PauseResultSchema = z.enum(["COMPLETED", "GAVE_IN", "CANCELLED"]);

export const PauseDuration = {
	SHORT: 90,
	LONG: 180,
} as const;
export type PauseDuration = (typeof PauseDuration)[keyof typeof PauseDuration];
export const PauseDurationSchema = z.union([z.literal(90), z.literal(180)]);

export const TriggerSource = {
	MANUAL: "MANUAL",
	WIDGET: "WIDGET",
	SHORTCUT: "SHORTCUT",
} as const;
export type TriggerSource = (typeof TriggerSource)[keyof typeof TriggerSource];
export const TriggerSourceSchema = z.enum(["MANUAL", "WIDGET", "SHORTCUT"]);

export const PauseEventSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	urgeType: UrgeTypeSchema,
	eventType: PauseEventTypeSchema,
	pauseDuration: z.number().int().optional(),
	result: PauseResultSchema.optional(),
	triggerSource: TriggerSourceSchema.optional(),
	snsAppName: z.string().optional(),
	timestamp: z.coerce.date(),
	localDayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	pauseStartEventId: z.string().uuid().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	createdAt: z.coerce.date().optional(),
});

export type PauseEvent = z.infer<typeof PauseEventSchema>;

export const ModuleSummarySchema = z.object({
	totalUrges: z.number().int().min(0),
	pauseAttempts: z.number().int().min(0),
	pauseCompleted: z.number().int().min(0),
	pauseGaveIn: z.number().int().min(0),
	pauseCancelled: z.number().int().min(0),
	successRate: z.number().min(0).max(100),
});

export type ModuleSummary = z.infer<typeof ModuleSummarySchema>;

export const TodaySummarySchema = z.object({
	dayKey: z.string(),
	totalUrges: z.number().int().min(0),
	pauseAttempts: z.number().int().min(0),
	pauseCompleted: z.number().int().min(0),
	pauseGaveIn: z.number().int().min(0),
	successRate: z.number().min(0).max(100),
	currentStreak: z.number().int().min(0),
	byType: z.object({
		SMOKE: ModuleSummarySchema,
		SNS: ModuleSummarySchema,
	}),
	lastEventAt: z.coerce.date().optional(),
});

export type TodaySummary = z.infer<typeof TodaySummarySchema>;

export const DailySummarySchema = z.object({
	dayKey: z.string(),
	pauseAttempts: z.number().int().min(0),
	pauseCompleted: z.number().int().min(0),
	pauseGaveIn: z.number().int().min(0),
	successRate: z.number().min(0).max(100),
});

export type DailySummary = z.infer<typeof DailySummarySchema>;

export const WeeklyReportSchema = z.object({
	weekStartKey: z.string(),
	weekEndKey: z.string(),
	dailySummaries: z.array(DailySummarySchema),
	totalPauseAttempts: z.number().int().min(0),
	totalCompleted: z.number().int().min(0),
	totalGaveIn: z.number().int().min(0),
	weeklySuccessRate: z.number().min(0).max(100),
	bestStreak: z.number().int().min(0),
	preferredDuration: z.number().int().optional(),
});

export type WeeklyReport = z.infer<typeof WeeklyReportSchema>;

export const ModuleSettingSchema = z.object({
	moduleType: UrgeTypeSchema,
	enabled: z.boolean().default(true),
	defaultDuration: z.number().int().default(90),
	trackedApps: z.array(z.string()).optional(),
});

export type ModuleSetting = z.infer<typeof ModuleSettingSchema>;

export const UserSettingsSchema = z.object({
	enabledModules: z.array(UrgeTypeSchema).default(["SMOKE"]),
	dayAnchorMinutes: z.number().int().min(0).max(1440).default(240),
	moduleSettings: z.array(ModuleSettingSchema).optional(),
	notifications: z
		.object({
			enabled: z.boolean().default(true),
			dailyReminder: z.boolean().default(false),
			dailyReminderTime: z.string().optional(),
		})
		.optional(),
	onboardingCompleted: z.boolean().default(false),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const CreatePauseStartInputSchema = z.object({
	urgeType: UrgeTypeSchema,
	pauseDuration: z
		.number()
		.int()
		.refine((v) => v === 90 || v === 180, {
			message: "Duration must be 90 or 180 seconds",
		}),
	triggerSource: TriggerSourceSchema.optional().default("MANUAL"),
	snsAppName: z.string().optional(),
});

export type CreatePauseStartInput = z.infer<typeof CreatePauseStartInputSchema>;

export const CreatePauseEndInputSchema = z.object({
	pauseStartEventId: z.string().uuid(),
	result: PauseResultSchema,
});

export type CreatePauseEndInput = z.infer<typeof CreatePauseEndInputSchema>;

export const UpdateSettingsInputSchema = UserSettingsSchema.partial();
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsInputSchema>;

export function isValidUrgeType(value: string): value is UrgeType {
	return value === "SMOKE" || value === "SNS";
}

export function isValidPauseResult(value: string): value is PauseResult {
	return value === "COMPLETED" || value === "GAVE_IN" || value === "CANCELLED";
}

export function isValidPauseDuration(value: number): value is PauseDuration {
	return value === 90 || value === 180;
}
