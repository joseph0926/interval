import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import { env } from "./lib/env.js";
import { SESSION_MAX_AGE_MS } from "./lib/constants.js";
import { authRoutes } from "./routes/auth.js";
import { smokingRoutes } from "./routes/smoking.js";
import { settingsRoutes } from "./routes/settings.js";
import { reportRoutes } from "./routes/report.js";
import { onboardingRoutes } from "./routes/onboarding.js";
import { gamificationRoutes } from "./routes/gamification.js";

export function buildApp() {
	const app = Fastify({
		logger: true,
	});

	app.register(cors, {
		origin: env.CORS_ORIGIN,
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	});

	app.register(cookie);

	app.register(session, {
		secret: env.SESSION_SECRET,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			maxAge: SESSION_MAX_AGE_MS,
		},
	});

	app.register(authRoutes, { prefix: "/api/auth" });
	app.register(smokingRoutes, { prefix: "/api/smoking" });
	app.register(settingsRoutes, { prefix: "/api/settings" });
	app.register(reportRoutes, { prefix: "/api/report" });
	app.register(onboardingRoutes, { prefix: "/api/onboarding" });
	app.register(gamificationRoutes, { prefix: "/api/gamification" });

	app.get("/api/health", async () => {
		return { status: "ok", timestamp: new Date().toISOString() };
	});

	return app;
}
