import ky from 'ky';
import { Hono } from 'hono';

import { env } from '../env';

const tmdb = new Hono();

tmdb.get('/', async (c) => {
	try {
		const endpoint = c.req.path.replace('/tmdb', '/3');
		const queries = c.req.queries();
		const params = new URLSearchParams(
			Object.entries(queries).map(([key, value]) => [key, value[0]])
		);

		const url = new URL(endpoint, env.API_BASE_URL);

		const response = await ky
			.get(url.toString(), {
				retry: 2,
				headers: {
					Authorization: `Bearer ${env.API_TOKEN}`,
				},
				searchParams: params,
			})
			.json();

		return c.json({ success: true, data: response }, 200);
	} catch (error) {
		console.error(error);
		return c.json({ success: false, message: 'Internal server error' }, 500);
	}
});

export default tmdb;
