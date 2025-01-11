import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { sign } from 'hono/jwt';

import { db } from '../db';
import { users as userTable } from '../db/schema';
import { env } from '../env';
import { setSignedCookie } from 'hono/cookie';

const auth = new Hono();

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

auth.post('/login', zValidator('json', loginSchema), async (c) => {
	const body = c.req.valid('json');

	try {
		const user = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, body.email))
			.then((res) => res[0]);
		if (!user) {
			return c.json({ ok: false, message: 'Invalid user' }, 404);
		}

		const isMatch = await Bun.password.verify(body.password, user.password);
		if (!isMatch) {
			return c.json({ ok: false, message: 'Wrong username or password' }, 401);
		}

		const token = await sign(
			{
				session: user.id,
				exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
			},
			env.SECRET
		);

		await setSignedCookie(c, 'session', token, env.SECRET, {
			path: '/',
			secure: true,
			httpOnly: true,
			maxAge: 24 * 60 * 60,
			sameSite: 'Lax',
		});

		return c.json({ ok: true, data: user.id });
	} catch (error) {
		console.error(error);
		return c.json({ ok: false, message: 'Internal server error' }, 500);
	}
});

export default auth;
