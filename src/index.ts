import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { logger } from 'hono/logger';
import { timeout } from 'hono/timeout';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimiter } from 'hono-rate-limiter';
import { RedisStore } from '@hono-rate-limiter/redis';
import { Redis } from '@upstash/redis';

import { env } from './env';
import tmdbRoutes from './routes/tmdb';
import movieApiRoutes from './routes/movie';
import authRoutes from './routes/auth';

export const app = new Hono();

const redis = new Redis({
	url: env.UPSTASH_REDIS_REST_URL,
	token: env.UPSTASH_REDIS_REST_TOKEN,
});

const limiter = rateLimiter({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-6',
	keyGenerator: (c) =>
		c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'anon',
	store: new RedisStore({ client: redis }),
});

app.use(csrf({ origin: 'ng-movie-nu.vercel.app' }));
app.use(limiter);
app.use('/api/*', cors());
app.use(logger());
app.use(secureHeaders());
app.use(timeout(10000));

app.get('/', (c) => c.text('Server is running...'));
app.route('/tmdb/*', tmdbRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/movie', movieApiRoutes);

Bun.serve({
	fetch: app.fetch,
	port: process.env.PORT || 8000,
});
