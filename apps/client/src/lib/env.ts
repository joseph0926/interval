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

function getApiUrl() {
	const baseEnv = validateEnv();

	if (
		typeof window !== "undefined" &&
		window.location.hostname === "10.0.2.2" &&
		baseEnv.VITE_API_URL.includes("localhost")
	) {
		return {
			...baseEnv,
			VITE_API_URL: baseEnv.VITE_API_URL.replace("localhost", "10.0.2.2"),
		};
	}

	return baseEnv;
}

export const env = getApiUrl();

export type Env = z.infer<typeof envSchema>;
