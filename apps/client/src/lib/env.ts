import { z } from "zod";

const envSchema = z.object({
	VITE_API_URL: z.string().url(),
});

function validateEnv() {
	const result = envSchema.safeParse(import.meta.env);

	if (!result.success) {
		const messages = result.error.issues
			.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
			.join("\n");

		throw new Error(`환경변수 검증 실패:\n${messages}`);
	}

	return result.data;
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
