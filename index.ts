import ky from 'ky';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimiter } from 'hono-rate-limiter';
import { RedisStore } from '@hono-rate-limiter/redis';
import { Redis } from '@upstash/redis';

export const app = new Hono();

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const limiter = rateLimiter({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-6',
	keyGenerator: (c) =>
		c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'anon',
	store: new RedisStore({ client: redis }),
});

app.use(limiter);
app.use('/api/*', cors());
app.use(logger());
app.use(secureHeaders());

app.get('/', (c) => c.text('Server is running...'));
app.get('/api/*', async (c) => {
	try {
		const endpoint = c.req.path.replace('/api', '/3');
		const queries = c.req.queries();
		const params = new URLSearchParams(
			Object.entries(queries).map(([key, value]) => [key, value[0]])
		);

		const url = new URL(endpoint, process.env.API_BASE_URL);
		const response = await ky
			.get(url.toString(), {
				retry: 2,
				headers: {
					Authorization: `Bearer ${process.env.API_TOKEN}`,
				},
				searchParams: params,
			})
			.json();

		return c.json({ ok: true, data: response }, 200);
	} catch (error) {
		console.error(error);
		return c.json({ ok: false, message: 'Internal server error' }, 500);
	}
});

Bun.serve({
	fetch: app.fetch,
	port: process.env.PORT || 8000,
});
