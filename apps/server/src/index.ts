import "dotenv/config";
import { buildApp } from "./app.js";
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";

const app = buildApp();

async function main() {
	try {
		await prisma.$connect();
		console.log("Database connected");

		await app.listen({ port: env.PORT, host: "0.0.0.0" });
		console.log(`Server running on http://localhost:${env.PORT}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
}

async function gracefulShutdown(signal: string) {
	console.log(`${signal} received, shutting down gracefully...`);
	await app.close();
	await prisma.$disconnect();
	console.log("Server closed");
	process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

main();
