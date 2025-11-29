import { buildApp } from "./app";
import type { Env } from "./config/env";

async function main() {
	const app = await buildApp();

	const { HOST, PORT } = app.getEnvs<Env>();

	await app.listen({ port: PORT, host: HOST });

	const shutdown = async (signal: string) => {
		app.log.info(`${signal} received, shutting down...`);
		await app.close();
		process.exit(0);
	};

	process.on("SIGINT", () => shutdown("SIGINT"));
	process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
