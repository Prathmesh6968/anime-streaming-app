import type { Anime, Episode, Review, WatchProgress, ReviewWithUser, ContentType, Profile } from '@/types';

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

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
  }): Promise<Anime[]> {
    const params = new URLSearchParams();
    if (filters?.genres?.length) params.set('genres', filters.genres.join(','));
    if (filters?.season) params.set('season', filters.season);
    if (filters?.year) params.set('year', filters.year.toString());
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.content_type) params.set('content_type', filters.content_type);
    if (filters?.limit) params.set('limit', filters.limit.toString());
    if (filters?.offset) params.set('offset', filters.offset.toString());
    
    const queryString = params.toString();
    return fetchApi<Anime[]>(`/anime${queryString ? `?${queryString}` : ''}`);
  },

  async getById(id: string): Promise<Anime | null> {
    try {
      return await fetchApi<Anime>(`/anime/${id}`);
    } catch {
      return null;
    }
  },

  async create(anime: Omit<Anime, 'id' | 'created_at' | 'rating'>): Promise<Anime> {
    return fetchApi<Anime>('/anime', {
      method: 'POST',
      body: JSON.stringify(anime),
    });
  },

  async update(id: string, anime: Partial<Anime>): Promise<Anime> {
    return fetchApi<Anime>(`/anime/${id}`, {
      method: 'PUT',
      body: JSON.stringify(anime),
    });
  },

  async delete(id: string): Promise<void> {
    await fetchApi(`/anime/${id}`, { method: 'DELETE' });
  },

  async getFeatured(limit = 6): Promise<Anime[]> {
    return fetchApi<Anime[]>(`/anime/featured?limit=${limit}`);
  },

  async getTrending(limit = 12): Promise<Anime[]> {
    return fetchApi<Anime[]>(`/anime/trending?limit=${limit}`);
  },

  async getBySeriesName(seriesName: string): Promise<Anime[]> {
    const all = await this.getAll();
    return all.filter(a => a.series_name === seriesName).sort((a, b) => a.season_number - b.season_number);
  }
};

export const episodeApi = {
  async getByAnimeId(animeId: string): Promise<Episode[]> {
    return fetchApi<Episode[]>(`/episodes/anime/${animeId}`);
  },

  async getById(id: string): Promise<Episode | null> {
    try {
      return await fetchApi<Episode>(`/episodes/${id}`);
    } catch {
      return null;
    }
  },

  async create(episode: Omit<Episode, 'id' | 'created_at'>): Promise<Episode> {
    return fetchApi<Episode>('/episodes', {
      method: 'POST',
      body: JSON.stringify(episode),
    });
  },

  async update(id: string, episode: Partial<Episode>): Promise<Episode> {
    return fetchApi<Episode>(`/episodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(episode),
    });
  },

  async delete(id: string): Promise<void> {
    await fetchApi(`/episodes/${id}`, { method: 'DELETE' });
  }
};

export const watchlistApi = {
  async getByUserId(userId: string): Promise<{ anime: Anime }[]> {
    return [];
  },

  async add(userId: string, animeId: string): Promise<void> {
  },

  async remove(userId: string, animeId: string): Promise<void> {
  },

  async isInWatchlist(userId: string, animeId: string): Promise<boolean> {
    return false;
  }
};

export const progressApi = {
  async getByUserId(userId: string, animeId?: string): Promise<WatchProgress[]> {
    return [];
  },

  async getByEpisodeId(userId: string, episodeId: string): Promise<WatchProgress | null> {
    return null;
  },

  async upsert(progress: Omit<WatchProgress, 'id' | 'updated_at'>): Promise<WatchProgress | null> {
    return null;
  },

  async markWatched(userId: string, episodeId: string, animeId: string, watched: boolean): Promise<void> {
  },

  async updatePosition(userId: string, episodeId: string, animeId: string, position: number): Promise<void> {
  }
};

export const reviewApi = {
  async getByAnimeId(animeId: string): Promise<ReviewWithUser[]> {
    return [];
  },

  async getUserReview(userId: string, animeId: string): Promise<Review | null> {
    return null;
  },

  async create(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review | null> {
    return null;
  },

  async update(id: string, review: Partial<Review>): Promise<Review | null> {
    return null;
  },

  async delete(id: string): Promise<void> {
  }
};

export const profileApi = {
  async getById(id: string): Promise<Profile | null> {
    try {
      return await fetchApi<Profile>(`/profiles/${id}`);
    } catch {
      return null;
    }
  },

  async getAll(): Promise<Profile[]> {
    return fetchApi<Profile[]>('/profiles');
  },

  async update(id: string, profile: Partial<{ username: string; avatar_url: string }>): Promise<Profile | null> {
    return null;
  },

  async updateRole(id: string, role: 'user' | 'admin'): Promise<Profile | null> {
    return fetchApi<Profile>(`/profiles/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }
};
