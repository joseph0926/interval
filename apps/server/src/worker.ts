/// <reference types="@cloudflare/workers-types" />

import { app } from "./app";

export interface Env {
	NODE_ENV: string;
	PORT: string;
	DATABASE_URL: string;
	SESSION_SECRET: string;
	CORS_ORIGIN: string;
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return app.fetch(request, env, ctx);
	},
};
