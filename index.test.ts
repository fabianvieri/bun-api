import { expect, test, describe } from 'bun:test';
import { app } from './index';

describe('Test API Endpoints', () => {
	test('GET /', async () => {
		const res = await app.request('/');
		expect(res.status).toBe(200);
	});

	test('GET /authentication', async () => {
		const res = await app.request('/api/authentication');
		expect(res.status).toBe(200);
	});

	test('GET /movie', async () => {
		const res = await app.request('/api/movie/52959');
		expect(res.status).toBe(200);
	});

	test('GET /api/search/movie', async () => {
		const res = await app.request(
			'/api/search/movie?query=star&include_adult=false&language=en-US&page=1'
		);
		expect(res.status).toBe(200);
	});
});