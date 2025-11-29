import { pgTable, uuid, text, integer, boolean, timestamp, real, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', ['Ongoing', 'Completed']);
export const contentTypeEnum = pgEnum('content_type', ['anime', 'cartoon']);
export const roleEnum = pgEnum('role', ['user', 'admin']);

export const anime = pgTable('anime', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  thumbnail_url: text('thumbnail_url'),
  banner_url: text('banner_url'),
  genres: text('genres').array().notNull().default([]),
  languages: text('languages').array(),
  season: text('season'),
  release_year: integer('release_year'),
  status: statusEnum('status').notNull().default('Ongoing'),
  total_episodes: integer('total_episodes').notNull().default(0),
  rating: real('rating').notNull().default(0),
  next_episode_date: timestamp('next_episode_date'),
  series_name: text('series_name').notNull(),
  season_number: integer('season_number').notNull().default(1),
  content_type: contentTypeEnum('content_type').notNull().default('anime'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const episodes = pgTable('episodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  anime_id: uuid('anime_id').notNull().references(() => anime.id, { onDelete: 'cascade' }),
  episode_number: integer('episode_number').notNull(),
  season_number: integer('season_number').notNull().default(1),
  title: text('title'),
  description: text('description'),
  video_url: text('video_url').notNull(),
  duration: integer('duration'),
  thumbnail_url: text('thumbnail_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email'),
  username: text('username'),
  avatar_url: text('avatar_url'),
  role: roleEnum('role').notNull().default('user'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const watchlist = pgTable('watchlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  anime_id: uuid('anime_id').notNull().references(() => anime.id, { onDelete: 'cascade' }),
  added_at: timestamp('added_at').defaultNow().notNull(),
});

export const watchProgress = pgTable('watch_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  episode_id: uuid('episode_id').notNull().references(() => episodes.id, { onDelete: 'cascade' }),
  anime_id: uuid('anime_id').notNull().references(() => anime.id, { onDelete: 'cascade' }),
  watched: boolean('watched').notNull().default(false),
  last_position: integer('last_position').notNull().default(0),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  anime_id: uuid('anime_id').notNull().references(() => anime.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const animeRelations = relations(anime, ({ many }) => ({
  episodes: many(episodes),
  watchlist: many(watchlist),
  reviews: many(reviews),
  watchProgress: many(watchProgress),
}));

export const episodesRelations = relations(episodes, ({ one, many }) => ({
  anime: one(anime, {
    fields: [episodes.anime_id],
    references: [anime.id],
  }),
  watchProgress: many(watchProgress),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  watchlist: many(watchlist),
  reviews: many(reviews),
  watchProgress: many(watchProgress),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(profiles, {
    fields: [watchlist.user_id],
    references: [profiles.id],
  }),
  anime: one(anime, {
    fields: [watchlist.anime_id],
    references: [anime.id],
  }),
}));

export const watchProgressRelations = relations(watchProgress, ({ one }) => ({
  user: one(profiles, {
    fields: [watchProgress.user_id],
    references: [profiles.id],
  }),
  episode: one(episodes, {
    fields: [watchProgress.episode_id],
    references: [episodes.id],
  }),
  anime: one(anime, {
    fields: [watchProgress.anime_id],
    references: [anime.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(profiles, {
    fields: [reviews.user_id],
    references: [profiles.id],
  }),
  anime: one(anime, {
    fields: [reviews.anime_id],
    references: [anime.id],
  }),
}));

export type Anime = typeof anime.$inferSelect;
export type InsertAnime = typeof anime.$inferInsert;
export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = typeof episodes.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
