import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { animeApi } from '@/db/api';
import { useSEO } from '@/hooks/use-seo';
import type { Anime } from '@/types';
import { ArrowRight, TrendingUp, Star } from 'lucide-react';

export default function Home() {
  const [featured, setFeatured] = useState<Anime[]>([]);
  const [trending, setTrending] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  // SEO for home page
  useSEO({
    title: 'Home',
    description: 'Watch free Hindi dubbed anime online. Stream your favorite anime series and movies in Hindi, English, Japanese and more languages. Best free anime website with Hindi dub and English sub. Browse by genre, season, and year. Track your watchlist and discover new trending anime.',
    keywords: 'free hindi dubbed anime, hindi dub anime, anime in hindi, watch anime in hindi, hindi anime website, free anime hindi, anime hindi dubbed, watch anime online free, anime streaming, trending anime, featured anime, popular anime, best anime website, free anime streaming site, anime series, anime movies, latest anime, new anime episodes',
    url: 'https://animestreamhub.com'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featuredData, trendingData] = await Promise.all([
          animeApi.getFeatured(6),
          animeApi.getTrending(12)
        ]);
        setFeatured(featuredData);
        setTrending(trendingData);
      } catch (error) {
        console.error('Error loading anime:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative py-12 xl:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-3xl xl:text-7xl font-bold mb-4 xl:mb-6 gradient-text">
            Welcome to AnimeStream Hub
          </h1>
          <p className="text-base xl:text-2xl text-muted-foreground mb-6 xl:mb-8 max-w-2xl mx-auto px-4">
            Discover, watch, and track your favorite anime series all in one place
          </p>
          <div className="flex flex-col xl:flex-row gap-3 xl:gap-4 justify-center px-4">
            <Button asChild size="lg" className="text-base xl:text-lg w-full xl:w-auto">
              <Link to="/browse">
                Browse Anime
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base xl:text-lg w-full xl:w-auto">
              <Link to="/watchlist">My Watchlist</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8 xl:py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6 xl:mb-8">
            <div className="flex items-center gap-2 xl:gap-3">
              <Star className="w-5 h-5 xl:w-6 xl:h-6 text-accent" />
              <h2 className="text-xl xl:text-3xl font-bold">Featured Anime</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs xl:text-base">
              <Link to="/browse">
                View All
                <ArrowRight className="ml-1 xl:ml-2 w-3 h-3 xl:w-4 xl:h-4" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 xl:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2 xl:space-y-3">
                  <Skeleton className="aspect-[2/3] w-full bg-muted" />
                  <Skeleton className="h-3 xl:h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-2 xl:h-3 w-1/2 bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 xl:gap-6">
              {featured.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-8 xl:py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6 xl:mb-8">
            <div className="flex items-center gap-2 xl:gap-3">
              <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6 text-accent" />
              <h2 className="text-xl xl:text-3xl font-bold">Trending Now</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs xl:text-base">
              <Link to="/browse?status=Ongoing">
                View All
                <ArrowRight className="ml-1 xl:ml-2 w-3 h-3 xl:w-4 xl:h-4" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 xl:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2 xl:space-y-3">
                  <Skeleton className="aspect-[2/3] w-full bg-muted" />
                  <Skeleton className="h-3 xl:h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-2 xl:h-3 w-1/2 bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 xl:gap-6">
              {trending.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
