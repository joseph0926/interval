import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";
import { rateLimiter } from "hono-rate-limiter";
import type { Context } from "hono";
import { env } from "../lib/env";

export const secureHeadersMiddleware = secureHeaders({
	xFrameOptions: "DENY",
	xContentTypeOptions: "nosniff",
	referrerPolicy: "strict-origin-when-cross-origin",
	crossOriginOpenerPolicy: "same-origin",
	crossOriginResourcePolicy: "same-origin",
});

export const csrfMiddleware = csrf({
	origin: env.CORS_ORIGIN.split(","),
});

export const rateLimitMiddleware = rateLimiter({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: "draft-6",
	keyGenerator: (c: Context) => {
		return c.req.header("x-forwarded-for")?.split(",")[0] || c.req.header("x-real-ip") || "unknown";
	},
});

export const authRateLimitMiddleware = rateLimiter({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-6",
	keyGenerator: (c: Context) => {
		return c.req.header("x-forwarded-for")?.split(",")[0] || c.req.header("x-real-ip") || "unknown";
	},
});
