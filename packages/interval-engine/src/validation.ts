import { z } from "zod";
import {
	ModuleTypeSchema,
	ReasonLabelSchema,
	ActionKindSchema,
	TriggerContextSchema,
	AdjustmentKindSchema,
} from "./types.js";

export const ALLOWED_DELAY_MINUTES = [1, 3, 5, 10] as const;

export const ActionEventInputSchema = z.object({
	moduleType: ModuleTypeSchema,
	timestamp: z.string().datetime().optional(),
	reasonLabel: ReasonLabelSchema.optional(),
	actionKind: ActionKindSchema.optional().default("CONSUME_OR_OPEN"),
});
export type ActionEventInput = z.infer<typeof ActionEventInputSchema>;

export const DelayEventInputSchema = z.object({
	moduleType: ModuleTypeSchema,
	delayMinutes: z
		.enum(["1", "3", "5", "10"])
		.transform(Number)
		.or(z.literal(1))
		.or(z.literal(3))
		.or(z.literal(5))
		.or(z.literal(10)),
	triggerContext: TriggerContextSchema,
	timestamp: z.string().datetime().optional(),
});
export type DelayEventInput = z.infer<typeof DelayEventInputSchema>;

export const AdjustmentEventInputSchema = z.object({
	moduleType: ModuleTypeSchema,
	adjustmentKind: AdjustmentKindSchema,
	payload: z.record(z.string(), z.unknown()).optional(),
});
export type AdjustmentEventInput = z.infer<typeof AdjustmentEventInputSchema>;

export const UpdateModuleSettingsInputSchema = z.object({
	moduleType: ModuleTypeSchema,
	enabled: z.boolean().optional(),
	targetIntervalMin: z.number().int().min(1).max(480).optional(),
});
export type UpdateModuleSettingsInput = z.infer<typeof UpdateModuleSettingsInputSchema>;

export const UpdateUserSettingsInputSchema = z.object({
	dayAnchorMinutes: z.number().int().min(0).max(1439).optional(),
	modules: z.array(UpdateModuleSettingsInputSchema).optional(),
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
