import { z } from "zod";
import { UrgeTypeSchema, PauseResultSchema, TriggerSourceSchema } from "./types.js";

export const ALLOWED_PAUSE_DURATIONS = [90, 180] as const;

export const PauseStartInputSchema = z.object({
	urgeType: UrgeTypeSchema,
	pauseDuration: z
		.number()
		.int()
		.refine((v) => v === 90 || v === 180, {
			message: "Duration must be 90 or 180 seconds",
		}),
	triggerSource: TriggerSourceSchema.optional().default("MANUAL"),
	snsAppName: z.string().optional(),
	timestamp: z.string().datetime().optional(),
});

export type PauseStartInput = z.infer<typeof PauseStartInputSchema>;

export const PauseEndInputSchema = z.object({
	pauseStartEventId: z.string().uuid(),
	result: PauseResultSchema,
	timestamp: z.string().datetime().optional(),
});

export type PauseEndInput = z.infer<typeof PauseEndInputSchema>;

export const UrgeInputSchema = z.object({
	urgeType: UrgeTypeSchema,
	triggerSource: TriggerSourceSchema.optional().default("MANUAL"),
	snsAppName: z.string().optional(),
	timestamp: z.string().datetime().optional(),
});

export type UrgeInput = z.infer<typeof UrgeInputSchema>;

export const UpdateModuleSettingInputSchema = z.object({
	moduleType: UrgeTypeSchema,
	enabled: z.boolean().optional(),
	defaultDuration: z
		.number()
		.int()
		.refine((v) => v === 90 || v === 180)
		.optional(),
	trackedApps: z.array(z.string()).optional(),
});

export type UpdateModuleSettingInput = z.infer<typeof UpdateModuleSettingInputSchema>;

export const UpdateUserSettingsInputSchema = z.object({
	dayAnchorMinutes: z.number().int().min(0).max(1439).optional(),
	enabledModules: z.array(UrgeTypeSchema).optional(),
	modules: z.array(UpdateModuleSettingInputSchema).optional(),
	notifications: z
		.object({
			enabled: z.boolean().optional(),
			dailyReminder: z.boolean().optional(),
			dailyReminderTime: z.string().optional(),
		})
		.optional(),
});

export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsInputSchema>;

export function validateTimestampNotTooFarInFuture(
	timestamp: string | undefined,
	maxFutureMinutes: number = 5,
): { valid: boolean; error?: string } {
	if (!timestamp) return { valid: true };

	const ts = new Date(timestamp);
	const now = new Date();
	const diffMs = ts.getTime() - now.getTime();
	const diffMinutes = diffMs / 60000;

	if (diffMinutes > maxFutureMinutes) {
		return {
			valid: false,
			error: `Timestamp cannot be more than ${maxFutureMinutes} minutes in the future`,
		};
	}

	return { valid: true };
}

export const KNOWN_SNS_APPS = [
	"instagram",
	"tiktok",
	"youtube",
	"twitter",
	"x",
	"facebook",
	"threads",
	"snapchat",
	"reddit",
	"linkedin",
	"pinterest",
	"other",
] as const;

export function isKnownSnsApp(appName: string): boolean {
	return KNOWN_SNS_APPS.includes(appName.toLowerCase() as (typeof KNOWN_SNS_APPS)[number]);
}

export function isValidDayKey(dayKey: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(dayKey);
}

export function parseDayKey(dayKey: string): Date | null {
	if (!isValidDayKey(dayKey)) return null;

	const [year, month, day] = dayKey.split("-").map(Number);
	return new Date(year, month - 1, day);
}
