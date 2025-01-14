import { z } from 'zod';

const envSchema = z.object({
	API_BASE_URL: z.string().url(),
	API_TOKEN: z.string().min(1),
	UPSTASH_REDIS_REST_URL: z.string().url(),
	UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
	DATABASE_URL: z.string().min(1),
	SECRET: z.string().min(1),
	CORS_ORIGIN: z.string().url(),
	PORT: z.string().regex(/^\d+$/).default('3000').transform(Number),
});

export const env = envSchema.parse(process.env);
