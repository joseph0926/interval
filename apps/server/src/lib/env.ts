import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.string().transform(Number).default(4001),
	DATABASE_URL: z.url(),
	SESSION_SECRET: z.string().min(32),
	CORS_ORIGIN: z.string().default("http://localhost:5173,https://interval-client.vercel.app"),
});

function validateEnv() {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error("❌ 환경변수 검증 실패:");
		result.error.issues.forEach((issue) => {
			console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
		});
		process.exit(1);
	}

	return result.data;
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
