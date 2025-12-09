import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler, notFoundHandler } from "./lib/error-handler";
import { env } from "./lib/env";
import {
	secureHeadersMiddleware,
	csrfMiddleware,
	rateLimitMiddleware,
} from "./middleware/security";
import { smokingRoutes } from "./routes/smoking";
import { settingsRoutes } from "./routes/settings";
import { authRoutes } from "./routes/auth";
import { reportRoutes } from "./routes/report";
import { onboardingRoutes } from "./routes/onboarding";

const app = new Hono()
	.use("*", logger())
	.use("*", secureHeadersMiddleware)
	.use("*", rateLimitMiddleware)
	.use(
		"*",
		cors({
			origin: env.CORS_ORIGIN.split(","),
			credentials: true,
		}),
	)
	.use("/api/*", csrfMiddleware)
	.onError(errorHandler)
	.notFound(notFoundHandler)
	.route("/api/auth", authRoutes)
	.route("/api/smoking", smokingRoutes)
	.route("/api/settings", settingsRoutes)
	.route("/api/report", reportRoutes)
	.route("/api/onboarding", onboardingRoutes);

export type AppType = typeof app;
export { app };
