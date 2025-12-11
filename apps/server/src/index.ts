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

process.on("SIGTERM", async () => {
	await prisma.$disconnect();
	await app.close();
});

main();
