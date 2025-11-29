import { supabase } from './supabase';
import type { Anime, Episode, Review, WatchProgress, ReviewWithUser, ContentType } from '@/types';

export const animeApi = {
  async getAll(filters?: {
    genres?: string[];
    season?: string;
    year?: number;
    status?: string;
    search?: string;
    content_type?: ContentType;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('anime')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.genres && filters.genres.length > 0) {
      query = query.overlaps('genres', filters.genres);
    }

    if (filters?.season) {
      query = query.eq('season', filters.season);
    }

    if (filters?.year) {
      query = query.eq('release_year', filters.year);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.content_type) {
      query = query.eq('content_type', filters.content_type);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(anime: Omit<Anime, 'id' | 'created_at' | 'rating'>) {
    const { data, error } = await supabase
      .from('anime')
      .insert([anime])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async update(id: string, anime: Partial<Anime>) {
    const { data, error } = await supabase
      .from('anime')
      .update(anime)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('anime')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getFeatured(limit = 6) {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('rating', { ascending: false })
      .order('id', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getTrending(limit = 12) {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .eq('status', 'Ongoing')
      .order('rating', { ascending: false })
      .order('id', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBySeriesName(seriesName: string) {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .eq('series_name', seriesName)
      .order('season_number', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

export const episodeApi = {
  async getByAnimeId(animeId: string) {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('anime_id', animeId)
      .order('episode_number', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(episode: Omit<Episode, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('episodes')
      .insert([episode])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async update(id: string, episode: Partial<Episode>) {
    const { data, error } = await supabase
      .from('episodes')
      .update(episode)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const watchlistApi = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('watchlist')
      .select(`
        *,
        anime:anime_id (*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async add(userId: string, animeId: string) {
    const { data, error } = await supabase
      .from('watchlist')
      .insert([{ user_id: userId, anime_id: animeId }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async remove(userId: string, animeId: string) {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('anime_id', animeId);

    if (error) throw error;
  },

  async isInWatchlist(userId: string, animeId: string) {
    const { data, error } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
};

export const progressApi = {
  async getByUserId(userId: string, animeId?: string) {
    let query = supabase
      .from('watch_progress')
      .select('*')
      .eq('user_id', userId);

    if (animeId) {
      query = query.eq('anime_id', animeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByEpisodeId(userId: string, episodeId: string) {
    const { data, error } = await supabase
      .from('watch_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('episode_id', episodeId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsert(progress: Omit<WatchProgress, 'id' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('watch_progress')
      .upsert([{ ...progress, updated_at: new Date().toISOString() }], {
        onConflict: 'user_id,episode_id'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async markWatched(userId: string, episodeId: string, animeId: string, watched: boolean) {
    return this.upsert({
      user_id: userId,
      episode_id: episodeId,
      anime_id: animeId,
      watched,
      last_position: 0
    });
  },

  async updatePosition(userId: string, episodeId: string, animeId: string, position: number) {
    return this.upsert({
      user_id: userId,
      episode_id: episodeId,
      anime_id: animeId,
      watched: false,
      last_position: position
    });
  }
};

export const reviewApi = {
  async getByAnimeId(animeId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('anime_id', animeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const reviews = Array.isArray(data) ? data : [];
    return reviews.map(review => ({
      ...review,
      username: (review.profiles as any)?.username || null,
      avatar_url: (review.profiles as any)?.avatar_url || null
    })) as ReviewWithUser[];
  },

  async getUserReview(userId: string, animeId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async update(id: string, review: Partial<Review>) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ ...review, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const profileApi = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async update(id: string, profile: Partial<{ username: string; avatar_url: string }>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateRole(id: string, role: 'user' | 'admin') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
