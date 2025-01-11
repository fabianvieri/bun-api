import { expect, test, describe } from 'bun:test';
import { app } from '.';

describe('Test API Endpoints', () => {
	test('GET /', async () => {
		const res = await app.request('/');
		expect(res.status).toBe(200);
	});

	test('GET /tmdb/authentication', async () => {
		const res = await app.request('/tmdb/authentication');
		expect(res.status).toBe(200);
	});
});
