import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const signupSchema = z
	.object({
		username: z.string().min(1),
		email: z.string().email(),
		password: z.string().min(8),
		confirmPassword: z.string().min(8),
	})
	.refine((value) => value.confirmPassword === value.password, {
		message: 'Password does not mathch',
	});
