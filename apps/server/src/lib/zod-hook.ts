import type { Context } from "hono";
import { ErrorCode, type ApiErrorResponse } from "./errors";

type HookResult = {
	success: boolean;
	error?: { issues: { path: unknown[]; message: string }[] };
};

export function zodErrorHook(result: HookResult, c: Context) {
	if (!result.success && result.error) {
		const response: ApiErrorResponse = {
			success: false,
			error: {
				code: ErrorCode.VALIDATION_ERROR,
				message: "입력값이 올바르지 않습니다",
				details: result.error.issues.map((issue) => ({
					path: (issue.path as (string | number)[]).join("."),
					message: issue.message,
				})),
			},
		};
		return c.json(response, 422);
	}
}
