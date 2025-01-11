import {
	pgTable,
	serial,
	text,
	varchar,
	timestamp,
	index,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		username: varchar('username', { length: 30 }).notNull(),
		email: varchar('email', { length: 50 }).notNull(),
		password: text('password').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(user) => [index('email_idx').on(user.email)]
);

export const favoriteMovies = pgTable(
	'favoriteMovies',
	{
		id: serial('id').primaryKey(),
		userId: serial('id')
			.references(() => users.id)
			.notNull(),
		movieId: varchar('movieId', { length: 255 }).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(movie) => [index('userId_idx').on(movie.userId)]
);
