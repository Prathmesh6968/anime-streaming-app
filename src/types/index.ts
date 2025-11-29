export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export type ContentType = 'anime' | 'cartoon';

export interface Anime {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  banner_url: string | null;
  genres: string[];
  languages: string[] | null;
  season: string | null;
  release_year: number | null;
  status: 'Ongoing' | 'Completed';
  total_episodes: number;
  rating: number;
  next_episode_date: string | null;
  series_name: string;
  season_number: number;
  content_type: ContentType;
  created_at: string;
}

export interface Episode {
  id: string;
  anime_id: string;
  episode_number: number;
  title: string | null;
  description: string | null;
  video_url: string;
  duration: number | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  anime_id: string;
  added_at: string;
}

export interface WatchProgress {
  id: string;
  user_id: string;
  episode_id: string;
  anime_id: string;
  watched: boolean;
  last_position: number;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  anime_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnimeWithProgress extends Anime {
  in_watchlist?: boolean;
  user_rating?: number;
  watched_episodes?: number;
  last_watched_episode?: number;
}

export interface EpisodeWithProgress extends Episode {
  watched?: boolean;
  last_position?: number;
}

export interface ReviewWithUser extends Review {
  username: string | null;
  avatar_url: string | null;
}
