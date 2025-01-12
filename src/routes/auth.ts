import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { setSignedCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';

import { db } from '../db';
import { env } from '../env';
import { users as userTable } from '../db/schema';

const auth = new Hono();

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

auth.post('/login', zValidator('json', loginSchema), async (c) => {
	const { email, password } = c.req.valid('json');
	try {
		const user = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.then((res) => res[0]);

		if (!user) {
			return c.json({ success: false, message: 'Invalid user' }, 404);
		}

		const isMatch = await Bun.password.verify(password, user.password);
		if (!isMatch) {
			return c.json(
				{ success: false, message: 'Wrong username or password' },
				401
			);
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

		return c.json({ success: true, data: { userId: user.id } });
	} catch (error) {
		console.error(error);
		return c.json({ success: false, message: 'Internal server error' }, 500);
	}
});

const signupSchema = z
	.object({
		username: z.string().min(1),
		email: z.string().email(),
		password: z.string().min(8),
		confirmPassword: z.string().min(8),
	})
	.refine((value) => value.confirmPassword === value.password, {
		message: 'Password does not mathch',
	});

auth.post('/signup', zValidator('json', signupSchema), async (c) => {
	const { password, username, email } = c.req.valid('json');
	try {
		const user = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.then((res) => res[0]);

		if (user) {
			return c.json({ success: false, message: 'User already exists' }, 400);
		}

		const hashedPassword = await Bun.password.hash(password);

		const newUserId = await db
			.insert(userTable)
			.values({ username, password: hashedPassword, email })
			.returning({ id: userTable.id })
			.then((res) => res[0]);

		return c.json({ success: true, data: { userId: newUserId } });
	} catch (error) {
		console.error(error);
		return c.json({ success: false, message: 'Internal server error' }, 500);
	}
});

export default auth;
