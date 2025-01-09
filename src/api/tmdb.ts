import { Hono } from 'hono';
import ky from 'ky';

const movie = new Hono();

movie.get('/', async (c) => {
	try {
		const endpoint = c.req.path.replace('/api/tmdb', '/3');
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

export default movie;
