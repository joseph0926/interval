import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string(),
	SESSION_SECRET: z.string().min(16),
	CORS_ORIGIN: z.string().default("http://localhost:3000"),
	PORT: z.coerce.number().default(4001),
});

export const env = envSchema.parse(process.env);
