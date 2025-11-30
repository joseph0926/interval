import Fastify from "fastify";
import env from "./plugins/env";
import cors from "./plugins/cors";
import health from "./routes/health";
import errorHandler from "./plugins/error-handler";
import prisma from "./plugins/prisma";
import trpc from "./plugins/trpc";

export async function buildApp() {
	const app = Fastify({ logger: true });

	await env(app);
	await cors(app);

	await prisma(app);

	await errorHandler(app);

	await trpc(app);
	await health(app);

	return app;
}
