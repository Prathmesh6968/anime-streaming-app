import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ReviewCard } from '@/components/anime/ReviewCard';
import { CountdownTimer } from '@/components/anime/CountdownTimer';
import { animeApi, episodeApi, watchlistApi, reviewApi } from '@/db/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/use-seo';
import type { Anime, Episode, ReviewWithUser } from '@/types';
import { Star, Plus, Check, Play, Calendar, TrendingUp, Languages } from 'lucide-react';

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userReview, setUserReview] = useState<{ rating: number; comment: string }>({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Dynamic SEO
  useSEO({
    title: anime?.title || 'Loading...',
    description: anime?.description 
      ? `${anime.description.substring(0, 150)}... Watch ${anime.title} online in ${anime.languages?.join(', ') || 'multiple languages'}. Free anime streaming with Hindi dub and English sub available.`
      : 'Watch this anime series online free with multiple language options including Hindi dub and English sub.',
    keywords: `${anime?.title || 'anime'}, watch ${anime?.title || 'anime'} online, ${anime?.title || 'anime'} hindi dubbed, ${anime?.title || 'anime'} in hindi, ${anime?.title || 'anime'} free, ${anime?.genres?.join(', ') || 'anime'}, ${anime?.languages?.includes('Hindi') ? `${anime?.title} hindi dub, hindi dubbed ${anime?.title}, ${anime?.title} hindi me,` : ''} ${anime?.languages?.join(' dub, ') || 'anime'} dub, ${anime?.status || ''} anime, watch ${anime?.title || 'anime'} online free, free anime streaming, anime episodes online`,
    image: anime?.banner_url || anime?.thumbnail_url,
    url: `https://animestreamhub.com/anime/${id}`,
    type: 'video.tv_show'
  });

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [animeData, episodesData, reviewsData] = await Promise.all([
          animeApi.getById(id),
          episodeApi.getByAnimeId(id),
          reviewApi.getByAnimeId(id)
        ]);

        setAnime(animeData);
        setEpisodes(episodesData);
        setReviews(reviewsData);

        if (user) {
          const isInList = await watchlistApi.isInWatchlist(user.id, id);
          setInWatchlist(isInList);

          const existingReview = await reviewApi.getUserReview(user.id, id);
          if (existingReview) {
            setUserReview({
              rating: existingReview.rating,
              comment: existingReview.comment || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading anime details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load anime details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  const handleWatchlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      if (inWatchlist) {
        await watchlistApi.remove(user.id, id);
        setInWatchlist(false);
        toast({ title: 'Removed from watchlist' });
      } else {
        await watchlistApi.add(user.id, id);
        setInWatchlist(true);
        toast({ title: 'Added to watchlist' });
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update watchlist',
        variant: 'destructive'
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !id) return;

    try {
      const existingReview = await reviewApi.getUserReview(user.id, id);
      
      if (existingReview) {
        await reviewApi.update(existingReview.id, {
          rating: userReview.rating,
          comment: userReview.comment
        });
      } else {
        await reviewApi.create({
          user_id: user.id,
          anime_id: id,
          rating: userReview.rating,
          comment: userReview.comment
        });
      }

      const updatedReviews = await reviewApi.getByAnimeId(id);
      setReviews(updatedReviews);
      
      const updatedAnime = await animeApi.getById(id);
      setAnime(updatedAnime);

      setDialogOpen(false);
      toast({ title: 'Review submitted successfully' });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive'
      });
    }
  };

  const handleWatchFirst = () => {
    if (episodes.length > 0) {
      navigate(`/watch/${episodes[0].id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-[400px] w-full mb-8 bg-muted" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3 bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-2/3 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Anime not found</h2>
          <Button asChild>
            <Link to="/browse">Browse Anime</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div
        className="relative h-[250px] xl:h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${anime.banner_url || anime.thumbnail_url || 'https://placehold.co/1920x400/1a202c/6b46c1?text=Banner'})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      </div>

      <div className="container mx-auto px-4 -mt-24 xl:-mt-32 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6 xl:gap-8">
          <div>
            <img
              src={anime.thumbnail_url || 'https://placehold.co/300x450/1a202c/6b46c1?text=No+Image'}
              alt={anime.title}
              className="w-full max-w-[200px] xl:max-w-none mx-auto xl:mx-0 rounded-lg shadow-glow"
            />
          </div>

          <div className="space-y-4 xl:space-y-6">
            <div>
              <h1 className="text-2xl xl:text-4xl font-bold mb-3 xl:mb-4">{anime.title}</h1>
              <div className="flex flex-wrap gap-2 mb-3 xl:mb-4">
                {anime.genres?.map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs xl:text-sm">
                    {genre}
                  </Badge>
                ))}
                <Badge className="bg-accent text-accent-foreground text-xs xl:text-sm">
                  {anime.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 xl:gap-6 text-xs xl:text-sm text-muted-foreground mb-3 xl:mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 xl:w-5 xl:h-5 fill-accent text-accent" />
                  <span className="text-base xl:text-lg font-semibold text-foreground">
                    {anime.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                {anime.release_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 xl:w-4 xl:h-4" />
                    <span>{anime.release_year}</span>
                  </div>
                )}
                {anime.total_episodes > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 xl:w-4 xl:h-4" />
                    <span>{anime.total_episodes} Episodes</span>
                  </div>
                )}
              </div>
              {anime.languages && anime.languages.length > 0 && (
                <div className="flex items-center gap-2 mb-3 xl:mb-4">
                  <Languages className="w-4 h-4 xl:w-5 xl:h-5 text-primary" />
                  <div className="flex flex-wrap gap-1.5">
                    {anime.languages.map((language) => (
                      <Badge 
                        key={language} 
                        variant="outline" 
                        className="text-xs xl:text-sm border-primary/50 text-primary"
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col xl:flex-row gap-3 xl:gap-4">
              <Button size="lg" onClick={handleWatchFirst} disabled={episodes.length === 0} className="w-full xl:w-auto">
                <Play className="w-5 h-5 mr-2" />
                Watch Now
              </Button>
              <Button
                size="lg"
                variant={inWatchlist ? 'secondary' : 'outline'}
                onClick={handleWatchlistToggle}
                className="w-full xl:w-auto"
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Watchlist
                  </>
                )}
              </Button>
              {user && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="w-full xl:w-auto">
                      <Star className="w-5 h-5 mr-2" />
                      Rate & Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rate & Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Rating: {userReview.rating}/10</Label>
                        <Slider
                          value={[userReview.rating]}
                          onValueChange={([value]) => setUserReview({ ...userReview, rating: value })}
                          min={1}
                          max={10}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Textarea
                          id="comment"
                          value={userReview.comment}
                          onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                          placeholder="Share your thoughts about this anime..."
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleSubmitReview} className="w-full">
                        Submit Review
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {anime.description && (
              <div>
                <h2 className="text-2xl font-bold mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {anime.description}
                </p>
              </div>
            )}

            {anime.status === 'Ongoing' && anime.next_episode_date && (
              <CountdownTimer targetDate={anime.next_episode_date} />
            )}

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-4">Episodes</h2>
              {episodes.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No episodes available yet
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {episodes.map((episode) => (
                    <Link key={episode.id} to={`/watch/${episode.id}`}>
                      <Card className="group hover:shadow-glow transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="font-semibold mb-1">
                            Episode {episode.episode_number}
                          </div>
                          {episode.title && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {episode.title}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No reviews yet. Be the first to review!
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
