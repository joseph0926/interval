import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const ErrorCode = {
	UNAUTHORIZED: "UNAUTHORIZED",
	INVALID_SESSION: "INVALID_SESSION",
	SESSION_EXPIRED: "SESSION_EXPIRED",
	VALIDATION_ERROR: "VALIDATION_ERROR",
	INVALID_INPUT: "INVALID_INPUT",
	NOT_FOUND: "NOT_FOUND",
	ALREADY_EXISTS: "ALREADY_EXISTS",
	INTERNAL_ERROR: "INTERNAL_ERROR",
	DATABASE_ERROR: "DATABASE_ERROR",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export type ApiErrorResponse = {
	success: false;
	error: {
		code: ErrorCodeType;
		message: string;
		details?: unknown;
	};
};

export class ApiError extends HTTPException {
	readonly code: ErrorCodeType;
	readonly details?: unknown;

	constructor(
		status: ContentfulStatusCode,
		code: ErrorCodeType,
		message: string,
		details?: unknown,
	) {
		super(status, { message });
		this.code = code;
		this.details = details;
	}

	toJSON(): ApiErrorResponse {
		const error: ApiErrorResponse["error"] = {
			code: this.code,
			message: this.message,
		};

		if (this.details !== undefined) {
			error.details = this.details;
		}

		return { success: false, error };
	}
}

export const Errors = {
	unauthorized: (message = "인증이 필요합니다") =>
		new ApiError(401, ErrorCode.UNAUTHORIZED, message),

	invalidSession: (message = "유효하지 않은 세션입니다") =>
		new ApiError(401, ErrorCode.INVALID_SESSION, message),

	sessionExpired: (message = "세션이 만료되었습니다") =>
		new ApiError(401, ErrorCode.SESSION_EXPIRED, message),

	validation: (message: string, details?: unknown) =>
		new ApiError(422, ErrorCode.VALIDATION_ERROR, message, details),

	invalidInput: (message: string, details?: unknown) =>
		new ApiError(400, ErrorCode.INVALID_INPUT, message, details),

	notFound: (resource = "리소스") =>
		new ApiError(404, ErrorCode.NOT_FOUND, `${resource}을(를) 찾을 수 없습니다`),

	alreadyExists: (resource = "리소스") =>
		new ApiError(409, ErrorCode.ALREADY_EXISTS, `${resource}이(가) 이미 존재합니다`),

	internal: (message = "서버 오류가 발생했습니다") =>
		new ApiError(500, ErrorCode.INTERNAL_ERROR, message),

	database: (message = "데이터베이스 오류가 발생했습니다") =>
		new ApiError(500, ErrorCode.DATABASE_ERROR, message),
} as const;
