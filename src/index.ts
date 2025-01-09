import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimiter } from 'hono-rate-limiter';
import { RedisStore } from '@hono-rate-limiter/redis';
import { Redis } from '@upstash/redis';

import movieRoutes from './api/tmdb';

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
app.route('/api/tmdb/*', movieRoutes);

Bun.serve({
	fetch: app.fetch,
	port: process.env.PORT || 8000,
});
