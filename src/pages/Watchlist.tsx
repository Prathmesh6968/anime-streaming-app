import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { watchlistApi } from '@/db/api';
import { useAuth } from '@/hooks/use-auth';
import type { Anime } from '@/types';
import { Bookmark } from 'lucide-react';

export default function Watchlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadWatchlist = async () => {
      try {
        const data = await watchlistApi.getByUserId(user.id);
        const animeList = data.map((item: any) => item.anime).filter(Boolean);
        setAnime(animeList);
      } catch (error) {
        console.error('Error loading watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen py-6 xl:py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl xl:text-4xl font-bold mb-6 xl:mb-8">My Watchlist</h1>
          <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 xl:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 xl:space-y-3">
                <Skeleton className="aspect-[2/3] w-full bg-muted" />
                <Skeleton className="h-3 xl:h-4 w-3/4 bg-muted" />
                <Skeleton className="h-2 xl:h-3 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 xl:py-8 px-4">
      <div className="container mx-auto">
        <div className="flex items-center gap-2 xl:gap-3 mb-6 xl:mb-8">
          <Bookmark className="w-6 h-6 xl:w-8 xl:h-8 text-accent" />
          <h1 className="text-2xl xl:text-4xl font-bold">My Watchlist</h1>
        </div>

        {anime.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 xl:w-16 xl:h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl xl:text-2xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-sm xl:text-base text-muted-foreground mb-6 px-4">
              Start adding anime to keep track of what you want to watch
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 xl:gap-6">
            {anime.map((item) => (
              <AnimeCard key={item.id} anime={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
