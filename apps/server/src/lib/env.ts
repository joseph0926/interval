import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string(),
	SESSION_SECRET: z.string().min(16),
	CORS_ORIGIN: z
		.string()
		.default("http://localhost:5173")
		.transform((val) => {
			const origins = val.split(",").map((s) => s.trim());
			return origins.length === 1 ? origins[0] : origins;
		}),
	PORT: z.coerce.number().default(4001),
});

export const env = envSchema.parse(process.env);
