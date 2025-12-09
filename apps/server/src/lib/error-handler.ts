import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { ApiError, ErrorCode, type ApiErrorResponse } from "./errors";

type ZodIssueFormatted = {
	path: string;
	message: string;
};

function formatZodErrors(error: ZodError): ZodIssueFormatted[] {
	return error.issues.map((issue) => ({
		path: issue.path.join("."),
		message: issue.message,
	}));
}

export function errorHandler(err: Error | HTTPException, c: Context): Response {
	if (err instanceof ApiError) {
		return c.json(err.toJSON(), err.status);
	}

	if (err instanceof ZodError) {
		const response: ApiErrorResponse = {
			success: false,
			error: {
				code: ErrorCode.VALIDATION_ERROR,
				message: "입력값이 올바르지 않습니다",
				details: formatZodErrors(err),
			},
		};
		return c.json(response, 422);
	}

	if (err instanceof HTTPException) {
		const response: ApiErrorResponse = {
			success: false,
			error: {
				code: ErrorCode.INTERNAL_ERROR,
				message: err.message,
			},
		};
		return c.json(response, err.status);
	}

	console.error("[Server Error]", err);

	const isDev = process.env.NODE_ENV !== "production";
	const response: ApiErrorResponse = {
		success: false,
		error: {
			code: ErrorCode.INTERNAL_ERROR,
			message: isDev ? err.message : "서버 오류가 발생했습니다",
			...(isDev && { details: err.stack }),
		},
	};

	return c.json(response, 500 as ContentfulStatusCode);
}

export function notFoundHandler(c: Context): Response {
	const response: ApiErrorResponse = {
		success: false,
		error: {
			code: ErrorCode.NOT_FOUND,
			message: `${c.req.method} ${c.req.path} 을(를) 찾을 수 없습니다`,
		},
	};
	return c.json(response, 404);
}
